import { ask, open } from "@tauri-apps/plugin-dialog";
import { makeAutoObservable } from "mobx";

import {
    ArticleResponse,
    BaseEntity,
    EntityType,
    ModalKey,
    ViewKey,
    WordType,
    WordUpsert,
} from "@/interface";
import { ArticleUpdateArguments, DomainManager } from "../domain";
import { ArticleCreator } from "./article-creator";
import { EntityEditor } from "./entity-editing";
import { ContextMenuManager } from "./context-menu-manager";
import { HomeManager } from "./home-manager";
import { ViewManagerInterface } from "./interface";
import { NavigationService } from "./navigation/navigation-service";
import { ProjectCreator } from "./project-creator";
import { SettingsEditor } from "./settings-editor";

export class ViewManager implements ViewManagerInterface {
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
    articleCreator: ArticleCreator;

    // context menu service
    contextMenu: ContextMenuManager;

    constructor(domain: DomainManager) {
        const overrides = {
            domain: false,
            home: false,
            settingsEditor: false,
            navigation: false,
            projectCreator: false,
            folderRemover: false,
            articleCreator: false,
            articleRemover: false,
            entityEditor: false,
            contextMenu: false,
        };
        makeAutoObservable(this, overrides);

        this.domain = domain;

        // central views
        this.home = new HomeManager(this);
        this.settingsEditor = new SettingsEditor(this);
        this.entityEditor = new EntityEditor(this);

        // navbar
        this.navigation = new NavigationService(this);

        // modals
        this.projectCreator = new ProjectCreator();
        this.articleCreator = new ArticleCreator(this);

        // context menu
        this.contextMenu = new ContextMenuManager(this);
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

    async fetchProjectInfo() {
        return this.domain.session.getSession().then((session) => {
            // TODO: trigger UI error state if the project info is unavailable
            this.home.initialize(session?.project?.name ?? "Error");
            return session?.project ?? null;
        });
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

    openArticleCreator(entityType: EntityType | undefined = undefined) {
        this.articleCreator.initialize(entityType);
        this._modalKey = ModalKey.ArticleCreator;
    }

    _openArticleEditor(article: ArticleResponse<BaseEntity>) {
        // save any unsynced data before opening another view
        this.cleanUp(ViewKey.EntityEditor);

        this.entityEditor.initializeArticleEditor(article);
        this.navigation.files.openArticleNode(article.id);
        this._viewKey = ViewKey.EntityEditor;
    }

    async openArticleEditor(id: number) {
        if (
            this.entityEditor.isArticleEditorOpen &&
            this.entityEditor.info.id == id
        )
            return; // the article is already open

        const article = await this.domain.articles.get(id);
        if (article) this._openArticleEditor(article);
    }

    async openWordEditor(languageId: number, wordType?: WordType) {
        if (
            this.entityEditor.isWordEditorOpen &&
            this.entityEditor.info.id == languageId
        ) {
            if (wordType === undefined)
                return; // the word editor is already open for this language
            else if (wordType === this.entityEditor.lexicon.wordType) return; // the word editor is already open for this language and word type
        }

        // save any unsynced data before opening another view
        this.cleanUp(ViewKey.EntityEditor);

        const article = this.domain.articles.getInfo(languageId);
        this.entityEditor.initializeWordEditor(
            languageId,
            article.title,
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
        this.navigation.files.editFolderNodeText(id);
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

    async createArticle() {
        let article = await this.articleCreator.createArticle(
            this.navigation.files.activeFolderId,
        );
        if (article) {
            this.closeModal();
            this.navigation.files.addNodeForCreatedArticle(article);
            this._openArticleEditor(article);
        }
        return article;
    }

    async updateArticle(update: ArticleUpdateArguments) {
        const response = await this.domain.articles.update(update);
        if (!response) return null;

        const { id, title } = update;
        if (title && title != "" && response.isTitleUnique)
            this.navigation.files.updateArticleNodeText(id, title);

        return response;
    }

    async updateLexicon(updates: WordUpsert[]) {
        return await this.domain.words.bulkUpsert(updates);
    }

    async deleteEntity(id: number, confirm: boolean = true) {
        if (confirm) {
            const article = this.domain.articles.getInfo(id);
            const message =
                `Are you sure you want to delete the article for '${article.title}' and all of its associated content?` +
                "This action is irreversible.";
            const canDelete = await ask(message, {
                title: "Delete article",
                kind: "warning",
                okLabel: "Delete",
                cancelLabel: "Cancel",
            });
            if (!canDelete) return false;
        }

        const success = await this.domain.articles.delete(id);
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
