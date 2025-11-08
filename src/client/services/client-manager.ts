import { makeAutoObservable } from "mobx";
import { ask, open } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";

import { IClientManager, PollEvent, SyncEntryEvent } from "@/client/interface";
import { EntryViewKey, ModalKey, ViewKey } from "@/client/constants";
import { EntityType, ROOT_FOLDER_ID, WordType, DomainManager } from "@/domain";
import { Id } from "@/interface";

import { ContextMenuManager } from "./context-menu";
import { DOMReferenceManager } from "./dom-reference-manager";
import { EntryCreator } from "./entry-creator";
import { EntryEditor } from "./entry-editor";
import { FooterManager } from "./footer-manager";
import { HeaderManager } from "./header-manager";
import { HomeManager } from "./home-manager";
import { NavigationService } from "./navigation";
import { ProjectCreator } from "./project-creator";
import { SettingsEditor } from "./settings-editor";
import { StyleManager } from "./style-manager";
import { Synchronizer } from "./synchronizer";

interface OpenEntryCreatorArguments {
    entityType?: EntityType;
    folderId?: Id;
}

interface OpenEntryEditorArguments {
    id: Id;
    viewKey: EntryViewKey;
    wordType?: WordType;
}

export class ClientManager implements IClientManager {
    // CONSTANTS
    readonly DEFAULT_CENTER_PADDING = 20;
    readonly DEFAULT_DIVIDER_HEIGHT = 24.8;
    readonly DEFAULT_SPACE_HEIGHT = 20;
    readonly SHARED_PORTAL_ID = "shared-portal";

    // STATE VARIABLES
    _viewKey: ViewKey = ViewKey.Home;
    _modalKey: ModalKey | null = null;

    // SERVICES
    domain: DomainManager;
    synchronizer: Synchronizer;
    home: HomeManager;
    entryEditor: EntryEditor;
    settingsEditor: SettingsEditor;
    header: HeaderManager;
    navigation: NavigationService;
    footer: FooterManager;
    projectCreator: ProjectCreator;
    entryCreator: EntryCreator;
    contextMenu: ContextMenuManager;
    style: StyleManager;
    domReferences: DOMReferenceManager;

    // CONSTRUCTION

    constructor() {
        this.domain = new DomainManager();

        this.synchronizer = new Synchronizer(this.domain);

        // miscellaneous
        this.style = new StyleManager();
        this.domReferences = new DOMReferenceManager();

        // central panel
        this.home = new HomeManager(this);
        this.settingsEditor = new SettingsEditor(this);

        this.entryEditor = new EntryEditor({
            client: this,
            synchronizer: this.synchronizer,
            wordEditor: {
                editableCellRef: this.domReferences.wordTableEditableCell,
            },
        });

        // peripheral panels
        this.header = new HeaderManager(this);
        this.footer = new FooterManager();
        this.navigation = new NavigationService({
            client: this,
            files: {
                editableTextRef: this.domReferences.fileNavEditableText,
            },
        });

        // modals
        this.projectCreator = new ProjectCreator();
        this.entryCreator = new EntryCreator();

        // context menu
        this.contextMenu = new ContextMenuManager();

        const overrides = {
            domain: false,
            style: false,
            domReferences: false,
            home: false,
            settingsEditor: false,
            entryEditor: false,
            header: false,
            footer: false,
            navigation: false,
            projectCreator: false,
            entryCreator: false,
            contextMenu: false,
        };
        makeAutoObservable(this, overrides);

        this._createSubscriptions();
    }

    // PROPERTIES

    get centerPadding() {
        return this.DEFAULT_CENTER_PADDING;
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

    get isEntryEditorOpen() {
        return this.currentView == ViewKey.EntryEditor;
    }

    get entityType() {
        if (this.isEntryEditorOpen) return this.entryEditor.info.entityType;
        return null;
    }

    get currentModal() {
        return this._modalKey;
    }

    set currentModal(key: ModalKey | null) {
        this._modalKey = key;
    }

    get viewSize() {
        const window = getCurrentWindow();
        return window.innerSize();
    }

    // STARTUP

    private _createSubscriptions() {
        this.entryEditor.onOpen.subscribe((id) =>
            this.navigation.files.openEntityNode(id),
        );

        this.header.onCreateProject.subscribe(() => this.openProjectCreator());
        this.header.onLoadProject.subscribe(() => this.loadProject());
        this.header.onCloseProject.subscribe(() => this.closeProject());
        this.header.onCreateEntry.subscribe(() => this.openEntryCreator());
        this.header.onOpenSettings.subscribe(() => this.openSettings());

        const fileNav = this.navigation.files;
        fileNav.onDeleteFolder.subscribe(({ id, confirm }) =>
            this.deleteFolder(id, confirm),
        );
        fileNav.onOpenFolderContext.subscribe((args) =>
            this.contextMenu.openForNavBarFolderNode(args),
        );
        fileNav.onOpenEntryContext.subscribe((args) =>
            this.contextMenu.openForNavBarEntryNode(args),
        );

        this.entryCreator.onCreateEntry.subscribe(
            ({ entityType, title, folderId }) =>
                this.createEntry(entityType, title, folderId),
        );

        this.contextMenu.onEditFolderName.subscribe(({ id }) =>
            this.editFolderName(id),
        );
        this.contextMenu.onDeleteFolder.subscribe(({ id }) =>
            this.deleteFolder(id),
        );
        this.contextMenu.onDeleteEntry.subscribe(({ id, title }) =>
            this.deleteEntry(id, title),
        );

        this.synchronizer.onPoll.subscribe((event) =>
            this._fetchChanges(event),
        );
        this.synchronizer.onSyncEntry.subscribe((event) =>
            this._handleEntrySynchronization(event),
        );
    }

    // LOADING

    async load() {
        const project = await this._fetchProjectInfo();
        if (project) this._populateNavigator();
    }

    private async _fetchProjectInfo() {
        return this.domain.session.getSession().then((session) => {
            // TODO: trigger UI error state if the project info is unavailable
            this.home.initialize(session?.project?.name ?? "Error");
            return session?.project ?? null;
        });
    }

    private async _populateNavigator() {
        // for now, the navigator is populated with ALL entries;
        // TODO: once entry pinning is supported, fetch the pinned entries from the backend
        const entries = await this.domain.entries.getAll();
        const folders = await this.domain.folders.getAll();

        if (entries && folders) this.navigation.initialize(entries, folders);
    }

    // VIEWS

    openHome() {
        this.cleanUp(ViewKey.Home);
        this.currentView = ViewKey.Home;
    }

    openSettings() {
        this.cleanUp(ViewKey.Settings);
        this.currentView = ViewKey.Settings;
    }

    async openEntryEditor({ id, viewKey, wordType }: OpenEntryEditorArguments) {
        this.cleanUp(ViewKey.EntryEditor);
        this.currentView = ViewKey.EntryEditor;

        if (viewKey == EntryViewKey.ArticleEditor)
            return this.entryEditor.openArticleEditor({ id });
        else if (viewKey == EntryViewKey.PropertyEditor)
            return this.entryEditor.openPropertyEditor(id);
        else if (viewKey == EntryViewKey.WordEditor)
            return this.entryEditor.openWordEditor(id, wordType);
        throw `Unable to open view with key ${viewKey}.`;
    }

    openProjectCreator() {
        this.projectCreator.initialize();
        this.currentModal = ModalKey.ProjectCreator;
    }

    openEntryCreator(args?: OpenEntryCreatorArguments) {
        this.entryCreator.initialize(
            args?.entityType,
            args?.folderId ?? ROOT_FOLDER_ID,
        );
        this.currentModal = ModalKey.EntryCreator;
    }

    closeModal() {
        this.currentModal = null;
    }

    // PROJECT HANDLING

    async createProject(name: string, dbFilePath: string) {
        // save any unsynced data before loading a new project
        this.cleanUp(this.currentView);

        const response = await this.domain.session.createProject(
            name,
            dbFilePath,
        );

        if (response) {
            this._populateNavigator();
            this.home.initialize(response.name);
            this.openHome();
        }

        return response;
    }

    async loadProject() {
        const path = await open();
        if (!path) return null;
        // save any unsynced data before loading another project
        this.cleanUp(this.currentView);

        const response = await this.domain.session.loadProject(path);
        if (response) {
            this._populateNavigator();
            this.home.initialize(response.name);
            this.openHome();
        }
        return response;
    }

    async closeProject() {
        // save any unsynced data before closing the project
        this.cleanUp(this.currentView);

        const success = await this.domain.session.closeProject();
        if (success) {
            this.navigation.reset();
            this.home.initialize("");
            this.openHome();
        }
        return success;
    }

    // FOLDER HANDLING

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
            this.currentView == ViewKey.EntryEditor &&
            fileIds.entries.includes(this.entryEditor.info.id)
        ) {
            // currently-open entry has been deleted
            this.openHome();
        }

        return fileIds;
    }

    // ENTRY HANDLING

    async createEntry(entityType: EntityType, title: string, folderId: Id) {
        const entry = await this.domain.entries.create(
            entityType,
            title,
            folderId,
        );

        if (entry) {
            this.navigation.files.addNodeForCreatedEntry(entry);
            this.entryEditor.openArticleEditor({
                id: entry.id,
                entityType,
                title: entry.title,
                text: "",
            });
        }

        return entry;
    }

    async deleteEntry(id: number, title: string, confirm = true) {
        // Currently, the title of the entry could be fetched from the cached file structure
        // rather than providing it as an argument. However, in the future, the file tree will
        // only include pinned entries. Once that feature is implemented, there will be no
        // guarantee that the entry is in the file tree.

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
            this.currentView == ViewKey.EntryEditor &&
            this.entryEditor.info.id == id
        ) {
            // deleted entry is currently open
            this.openHome();
        }

        this.navigation.files.deleteEntityNode(id);

        return true;
    }

    // SYNCHRONIZATION

    private _fetchChanges(event: PollEvent) {
        return { entries: this.entryEditor.fetchChanges(event) };
    }

    private _handleEntrySynchronization(event: SyncEntryEvent) {
        this.entryEditor.handleSynchronization(event);

        if (
            event.request.title &&
            event.response.title &&
            event.response.title.isUnique
        )
            this.navigation.files.updateEntityNodeText(
                event.request.id,
                event.request.title,
            );
    }

    // HOOKS

    hook() {
        this.contextMenu.hook();

        this.navigation.files.hook();

        const wordSpreadsheet = this.entryEditor.lexicon.spreadsheet;
        wordSpreadsheet.hook();
    }

    // CLEAN UP

    cleanUp(newViewKey: ViewKey | null = null) {
        if (this.currentModal) this.closeModal();

        if (this.currentView == ViewKey.EntryEditor) this.entryEditor.cleanUp();

        if (
            this.isEntryEditorOpen &&
            (!newViewKey || newViewKey != ViewKey.EntryEditor)
        ) {
            this.navigation.files.openedNode = null;
            this.navigation.files.selectedNode = null;
        }
    }
}
