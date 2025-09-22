import { makeAutoObservable } from "mobx";
import { ask, open } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";

import { OpenEntryCreatorArguments, IClientManager } from "@/client/interface";
import { EntryViewKey, ModalKey, ViewKey } from "@/client/constants";
import {
    EntityType,
    ROOT_FOLDER_ID,
    WordType,
    DomainManager,
    WordUpsert,
} from "@/domain";
import { Id } from "@/interface";

import { EntryCreator } from "./entry-creator";
import { EntryEditor } from "./entry-editor";
import { ContextMenuManager } from "./context-menu-manager";
import { HomeManager } from "./home-manager";
import { NavigationService } from "./navigation/navigation-service";
import { ProjectCreator } from "./project-creator";
import { SettingsEditor } from "./settings-editor";
import { StyleManager } from "./style-manager";
import { HeaderService } from "./header-service";
import { DOMReferenceManager } from "./dom-reference-manager";

export class ClientManager implements IClientManager {
    // constants
    HEADER_HEIGHT = 30;
    FOOTER_HEIGHT = 25;
    NAVBAR_WIDTH = 300;
    MAIN_PADDING = 20;
    DEFAULT_DIVIDER_HEIGHT = 24.8;
    DEFAULT_SPACE_HEIGHT = 20;
    SHARED_PORTAL_ID = "shared-portal";

    // state variables
    _viewKey: ViewKey = ViewKey.Home;
    _modalKey: ModalKey | null = null;
    _navBarMobileOpen = true;

    // domain service
    domain: DomainManager;

    // central view services
    home: HomeManager;
    entryEditor: EntryEditor;
    settingsEditor: SettingsEditor;

    // bar services
    header: HeaderService;
    navigation: NavigationService;

    // modal services
    projectCreator: ProjectCreator;
    entryCreator: EntryCreator;

    // context menu service
    contextMenu: ContextMenuManager;

    // miscellaneous
    style: StyleManager;
    domReferences: DOMReferenceManager;

    constructor() {
        this.domain = new DomainManager();

        // miscellaneous
        this.style = new StyleManager();
        this.domReferences = new DOMReferenceManager();

        // central views
        this.home = new HomeManager(this);
        this.settingsEditor = new SettingsEditor(this);
        this.entryEditor = new EntryEditor({
            client: this,
            wordEditor: {
                editableCellRef: this.domReferences.wordTableEditableCell,
            },
        });

        // bars
        this.header = new HeaderService(this);
        this.navigation = new NavigationService({
            client: this,
            files: {
                editableTextRef: this.domReferences.fileNavEditableText,
            },
        });

        // modals
        this.projectCreator = new ProjectCreator();
        this.entryCreator = new EntryCreator(this);

        // context menu
        this.contextMenu = new ContextMenuManager(this);

        const overrides = {
            domain: false,
            dimensions: false,
            style: false,
            domReferences: false,
            home: false,
            settingsEditor: false,
            navigation: false,
            projectCreator: false,
            folderRemover: false,
            entityCreator: false,
            entityEditor: false,
            contextMenu: false,
        };
        makeAutoObservable(this, overrides);
    }

    get headerHeight() {
        return this.HEADER_HEIGHT;
    }

    get footerHeight() {
        return this.FOOTER_HEIGHT;
    }

    get navbarWidth() {
        return this.NAVBAR_WIDTH;
    }

    get mainPadding() {
        return this.MAIN_PADDING;
    }

    get defaultDividerHeight() {
        return this.DEFAULT_DIVIDER_HEIGHT;
    }

    get defaultSpaceHeight() {
        return this.DEFAULT_SPACE_HEIGHT;
    }

    get sharedPortalId() {
        return this.SHARED_PORTAL_ID;
    }

    get sharedPortalSelector() {
        return `#${this.sharedPortalId}`;
    }

    get currentView() {
        return this._viewKey;
    }

    set currentView(key: ViewKey) {
        this._viewKey = key;
    }

    get isEntityEditorOpen() {
        return this._viewKey == ViewKey.EntityEditor;
    }

    get isArticleEditorOpen() {
        return (
            this.currentView == ViewKey.EntityEditor &&
            this.entryEditor.currentView == EntryViewKey.ArticleEditor
        );
    }

    get isPropertyEditorOpen() {
        return (
            this.currentView == ViewKey.EntityEditor &&
            this.entryEditor.currentView == EntryViewKey.PropertyEditor
        );
    }

    get isWordEditorOpen() {
        return (
            this.currentView == ViewKey.EntityEditor &&
            this.entryEditor.currentView == EntryViewKey.WordEditor
        );
    }

    get entityType() {
        if (this.isEntityEditorOpen) return this.entryEditor.info.entityType;
        return null;
    }

    get currentModal() {
        return this._modalKey;
    }

    set currentModal(key: ModalKey | null) {
        this._modalKey = key;
    }

    get navBarMobileOpen() {
        return this._navBarMobileOpen;
    }

    set navBarMobileOpen(open: boolean) {
        this._navBarMobileOpen = open;
    }

    async initialize() {
        const project = await this.fetchProjectInfo();
        if (project) this.populateNavigator();
    }

    async getViewSize() {
        const window = getCurrentWindow();
        return window.innerSize();
    }

    async fetchProjectInfo() {
        return this.domain.session.getSession().then((session) => {
            // TODO: trigger UI error state if the project info is unavailable
            this.home.initialize(session?.project?.name ?? "Error");
            return session?.project ?? null;
        });
    }

    injectHooks() {
        this.navigation.files.hookEditableNodeEffect();

        const wordSpreadsheet = this.entryEditor.lexicon.spreadsheet;
        wordSpreadsheet.hookEditableCellEffect();
    }

    async populateNavigator() {
        // for now, the navigator is populated with ALL entries;
        // TODO: once entry pinning is supported, fetch the pinned entries from the backend
        const entries = await this.domain.entries.getAll();
        const folders = await this.domain.folders.getAll();

        if (entries && folders) this.navigation.initialize(entries, folders);
    }

    toggleNavBar() {
        this._navBarMobileOpen = !this._navBarMobileOpen;
    }

    openHome() {
        this.cleanUp(ViewKey.Home);
        this._viewKey = ViewKey.Home;
    }

    openSettings() {
        this.cleanUp(ViewKey.Settings);
        this._viewKey = ViewKey.Settings;
    }

    openProjectCreator() {
        this.projectCreator.initialize();
        this._modalKey = ModalKey.ProjectCreator;
    }

    openEntryCreator(args?: OpenEntryCreatorArguments) {
        this.entryCreator.initialize(
            args?.entityType,
            args?.folderId ?? ROOT_FOLDER_ID,
        );
        this._modalKey = ModalKey.EntryCreator;
    }

    async openArticleEditor(id: Id) {
        if (this.isArticleEditorOpen && this.entryEditor.info.id == id) return; // the article is already open
        const response = await this.domain.entries.getArticle(id);
        if (response !== null)
            this._openArticleEditor(
                id,
                response.info.entity_type,
                response.info.title,
                response.text,
            );
    }

    _openArticleEditor(
        id: Id,
        entityType: EntityType,
        title: string,
        text: string,
    ) {
        // save any unsynced data before opening another view
        this.cleanUp(ViewKey.EntityEditor);
        this.entryEditor.initializeArticleEditor(id, entityType, title, text);
        this.navigation.files.openEntityNode(id);
        this._viewKey = ViewKey.EntityEditor;
    }

    async openPropertyEditor(id: Id) {
        if (this.isPropertyEditorOpen && this.entryEditor.info.id == id) return; // the property editor is already open

        const response = await this.domain.entries.getProperties(id);

        if (response !== null) {
            // save any unsynced data before opening another view
            this.cleanUp(ViewKey.EntityEditor);

            this.entryEditor.initializePropertyEditor(
                id,
                response.info.entity_type,
                response.info.title,
                response.properties,
            );
            this.navigation.files.openEntityNode(id);
            this.currentView = ViewKey.EntityEditor;
        }
    }

    async openWordEditor(languageId: Id, wordType?: WordType) {
        if (this.isWordEditorOpen && this.entryEditor.info.id == languageId) {
            if (wordType === undefined)
                // don't care about which word type is displayed;
                // since the word editor is already open for this language, don't reload it
                return;
            else if (wordType === this.entryEditor.lexicon.wordType)
                // the word editor is already open for this language and word type
                return;
        }

        // save any unsynced data before opening another view
        this.cleanUp(ViewKey.EntityEditor);

        const info = await this.domain.entries.get(languageId);

        if (info !== null) {
            this.entryEditor.initializeWordEditor(
                languageId,
                info.title,
                wordType,
            );
            this.navigation.files.openEntityNode(languageId);
            this._viewKey = ViewKey.EntityEditor;
        }
    }

    closeModal() {
        this._modalKey = null;
    }

    async createProject(name: string, dbFilePath: string) {
        // save any unsynced data before loading a new project
        this.cleanUp(this._viewKey);

        const response = await this.domain.session.createProject(
            name,
            dbFilePath,
        );

        if (response) {
            this.populateNavigator();
            this.home.initialize(response.name);
            this.openHome();
        }

        return response;
    }

    async loadProject() {
        const path = await open();
        if (!path) return null;
        // save any unsynced data before loading another project
        this.cleanUp(this._viewKey);

        const response = await this.domain.session.loadProject(path);
        if (response) {
            this.populateNavigator();
            this.home.initialize(response.name);
            this.openHome();
        }
        return response;
    }

    async closeProject() {
        // save any unsynced data before closing the project
        this.cleanUp(this._viewKey);

        const success = await this.domain.session.closeProject();
        if (success) {
            this.navigation.reset();
            this.home.initialize("");
            this.openHome();
        }
        return success;
    }

    editFolderName(id: number) {
        this.navigation.files.toggleFolderAsEditable(id);
    }

    async deleteFolder(id: number, confirm = true) {
        if (confirm) {
            const folder = this.domain.folders.getInfo(id);
            const canDelete = await ask(
                `Are you sure you want to delete folder '${folder.name}' and its contents? This action is irreversible.`,
                {
                    title: "Delete folder",
                    kind: "warning",
                    okLabel: "Delete",
                    cancelLabel: "Cancel",
                },
            );
            if (!canDelete) return null;
        }

        const fileIds = await this.domain.folders.delete(id);

        this.navigation.files.deleteManyNodes(fileIds.entries, fileIds.folders);

        if (
            this._viewKey == ViewKey.EntityEditor &&
            fileIds.entries.includes(this.entryEditor.info.id)
        ) {
            // currently-open entry has been deleted
            this.openHome();
        }

        return fileIds;
    }

    async createEntry(entityType: EntityType, title: string, folderId: Id) {
        const entry = await this.domain.entries.create(
            entityType,
            title,
            folderId,
        );

        if (entry) {
            this.navigation.files.addNodeForCreatedEntry(entry);
            this._openArticleEditor(entry.id, entityType, entry.title, "");
        }

        return entry;
    }

    async updateEntryTitle(id: Id, title: string) {
        const response = await this.domain.entries.updateTitle(id, title);
        if (title != "" && response.isUnique)
            this.navigation.files.updateEntityNodeText(id, title);
        return response;
    }

    async updateLexicon(updates: WordUpsert[]) {
        return await this.domain.words.bulkUpsert(updates);
    }

    async deleteEntry(id: number, title: string, confirm = true) {
        if (confirm) {
            const message =
                `Are you sure you want to delete '${title}' and all of its associated content? ` +
                "This action is irreversible.";
            const canDelete = await ask(message, {
                title: "Delete entry",
                kind: "warning",
                okLabel: "Delete",
                cancelLabel: "Cancel",
            });
            if (!canDelete) return false;
        }

        const success = await this.domain.entries.delete(id);
        if (!success)
            // failed to delete the entry; aborting
            return false;

        if (
            this._viewKey == ViewKey.EntityEditor &&
            this.entryEditor.info.id == id
        ) {
            // deleted entry is currently open
            this.openHome();
        }

        this.navigation.files.deleteEntityNode(id);

        return true;
    }

    cleanUp(newViewKey: ViewKey | null = null) {
        if (this._modalKey) this.closeModal();

        if (this._viewKey == ViewKey.EntityEditor) this.entryEditor.cleanUp();

        if (
            this.isEntityEditorOpen &&
            (!newViewKey || !this.isEntityEditorOpen)
        ) {
            this.navigation.files.openedNode = null;
            this.navigation.files.selectedNode = null;
        }

        this.navBarMobileOpen = false;
    }
}
