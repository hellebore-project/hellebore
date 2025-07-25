import { getCurrentWindow } from "@tauri-apps/api/window";
import { ask, open } from "@tauri-apps/plugin-dialog";
import { makeAutoObservable } from "mobx";

import {
    EntityType,
    EntityViewKey,
    Id,
    ModalKey,
    ViewKey,
    WordType,
    WordUpsert,
} from "@/interface";
import { DomainManager } from "../domain";
import { EntityCreator } from "./entity-creator";
import { EntityEditor } from "./entity-editing";
import { ContextMenuManager } from "./context-menu-manager";
import { HomeManager } from "./home-manager";
import { ViewManagerInterface } from "./interface";
import { NavigationService } from "./navigation/navigation-service";
import { ProjectCreator } from "./project-creator";
import { SettingsEditor } from "./settings-editor";
import { StyleManager } from "./style-manager";

export class ViewManager implements ViewManagerInterface {
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
    _navBarMobileOpen: boolean = true;

    // domain service
    domain: DomainManager;

    // central view services
    home: HomeManager;
    entityEditor: EntityEditor;
    settingsEditor: SettingsEditor;

    // navigation bar service
    navigation: NavigationService;

    // modal services
    projectCreator: ProjectCreator;
    entityCreator: EntityCreator;

    // context menu service
    contextMenu: ContextMenuManager;

    // miscellaneous
    style: StyleManager;

    constructor(domain: DomainManager) {
        const overrides = {
            domain: false,
            dimensions: false,
            style: false,
            home: false,
            settingsEditor: false,
            navigation: false,
            projectCreator: false,
            folderRemover: false,
            entityCreator: false,
            articleRemover: false,
            entityEditor: false,
            contextMenu: false,
        };
        makeAutoObservable(this, overrides);

        this.domain = domain;

        // miscellaneous
        this.style = new StyleManager();

        // central views
        this.home = new HomeManager(this);
        this.settingsEditor = new SettingsEditor(this);
        this.entityEditor = new EntityEditor(this);

        // navbar
        this.navigation = new NavigationService(this);

        // modals
        this.projectCreator = new ProjectCreator();
        this.entityCreator = new EntityCreator(this);

        // context menu
        this.contextMenu = new ContextMenuManager(this);
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
            this.entityEditor.currentView == EntityViewKey.ArticleEditor
        );
    }

    get isPropertyEditorOpen() {
        return (
            this.currentView == ViewKey.EntityEditor &&
            this.entityEditor.currentView == EntityViewKey.PropertyEditor
        );
    }

    get isWordEditorOpen() {
        return (
            this.currentView == ViewKey.EntityEditor &&
            this.entityEditor.currentView == EntityViewKey.WordEditor
        );
    }

    get entityType() {
        if (this.isEntityEditorOpen) return this.entityEditor.info.entityType;
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

        const wordSpreadsheet = this.entityEditor.lexicon.spreadsheet;
        wordSpreadsheet.hookEditableCellEffect();
    }

    async populateNavigator() {
        const articles = await this.domain.articles.getAll();
        const folders = await this.domain.folders.getAll();

        if (articles && folders) this.navigation.initialize(articles, folders);
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

    openEntityCreator(entityType: EntityType | undefined = undefined) {
        this.entityCreator.initialize(entityType);
        this._modalKey = ModalKey.ArticleCreator;
    }

    async openArticleEditor(id: Id) {
        if (this.isArticleEditorOpen && this.entityEditor.info.id == id) return; // the article is already open

        const title = this.domain.structure.getInfo(id).title;
        const text = await this.domain.articles.getText(id);
        if (text) this._openArticleEditor(id, title, text);
    }

    _openArticleEditor(id: Id, title: string, text: string) {
        // save any unsynced data before opening another view
        this.cleanUp(ViewKey.EntityEditor);

        this.entityEditor.initializeArticleEditor(id, title, text);
        this.navigation.files.openArticleNode(id);
        this._viewKey = ViewKey.EntityEditor;
    }

    async openPropertyEditor(id: Id) {
        if (this.isPropertyEditorOpen && this.entityEditor.info.id == id)
            return; // the property editor is already open

        const info = this.domain.structure.getInfo(id);
        const properties = await this.domain.entities.get(id, info.entity_type);

        if (properties !== null) {
            // save any unsynced data before opening another view
            this.cleanUp(ViewKey.EntityEditor);

            this.entityEditor.initializePropertyEditor(
                id,
                info.title,
                properties,
            );
            this.navigation.files.openArticleNode(id);
            this.currentView = ViewKey.EntityEditor;
        }
    }

    async openWordEditor(languageId: Id, wordType?: WordType) {
        if (this.isWordEditorOpen && this.entityEditor.info.id == languageId) {
            if (wordType === undefined)
                // don't care about which word type is displayed;
                // since the word editor is already open for this language, don't reload it
                return;
            else if (wordType === this.entityEditor.lexicon.wordType)
                // the word editor is already open for this language and word type
                return;
        }

        // save any unsynced data before opening another view
        this.cleanUp(ViewKey.EntityEditor);

        const info = this.domain.structure.getInfo(languageId);
        this.entityEditor.initializeWordEditor(
            languageId,
            info.title,
            wordType,
        );
        this.navigation.files.openArticleNode(languageId);
        this._viewKey = ViewKey.EntityEditor;
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

    async deleteFolder(id: number, confirm: boolean = true) {
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
        if (!fileIds) return null;

        for (const folderId of fileIds.folders)
            this.navigation.files.deleteFolderNode(folderId);
        for (const articleId of fileIds.articles)
            this.navigation.files.deleteArticleNode(articleId);

        if (
            this._viewKey == ViewKey.EntityEditor &&
            fileIds.articles.includes(this.entityEditor.info.id)
        ) {
            // currently-open article has been deleted
            this.openHome();
        }

        return fileIds;
    }

    async createEntity() {
        let entity = await this.entityCreator.createEntity(
            this.navigation.files.activeFolderId,
        );
        if (entity) {
            this.closeModal();
            this.navigation.files.addNodeForCreatedArticle(entity);
            this._openArticleEditor(entity.id, entity.title, "");
        }
        return entity;
    }

    async updateArticleTitle(id: Id, title: string) {
        const response = await this.domain.articles.updateTitle(id, title);
        if (title != "" && response.isUnique)
            this.navigation.files.updateArticleNodeText(id, title);
        return response;
    }

    async updateLexicon(updates: WordUpsert[]) {
        return await this.domain.words.bulkUpsert(updates);
    }

    async deleteEntity(id: number, confirm: boolean = true) {
        if (confirm) {
            const info = this.domain.structure.getInfo(id);
            const message =
                `Are you sure you want to delete the article '${info.title}' and all of its associated content?` +
                "This action is irreversible.";
            const canDelete = await ask(message, {
                title: "Delete article",
                kind: "warning",
                okLabel: "Delete",
                cancelLabel: "Cancel",
            });
            if (!canDelete) return false;
        }

        const success = await this.domain.entities.delete(id);
        if (!success)
            // failed to delete the article; aborting
            return false;

        if (
            this._viewKey == ViewKey.EntityEditor &&
            this.entityEditor.info.id == id
        ) {
            // deleted article is currently open
            this.openHome();
        }

        this.navigation.files.deleteArticleNode(id);

        return true;
    }

    cleanUp(newViewKey: ViewKey | null = null) {
        if (this._modalKey) this.closeModal();

        if (this._viewKey == ViewKey.EntityEditor) this.entityEditor.cleanUp();

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
