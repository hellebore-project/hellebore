import { ask, open } from "@tauri-apps/plugin-dialog";
import { makeAutoObservable } from "mobx";

import {
    ArticleResponse,
    BaseEntity,
    EntityType,
    ModalKey,
    ViewKey,
} from "@/interface";
import { ArticleUpdateArguments, DomainManager } from "../domain";
import { ArticleCreator } from "./article-creator";
import { ArticleEditor } from "./article-editing";
import { ContextMenuManager } from "./context-menu-manager";
import { HomeManager } from "./home-manager";
import { NavigationService } from "./navigation/navigation-service";
import { ProjectCreator } from "./project-creator";
import { SettingsEditor } from "./settings-editor";
import { ViewManagerInterface } from "./view-manager-interface";

export class ViewManager implements ViewManagerInterface {
    // state variables
    viewKey: ViewKey = ViewKey.HOME;
    modalKey: ModalKey | null = null;
    navBarMobileOpen: boolean = true;

    // domain service
    domain: DomainManager;

    // central view services
    home: HomeManager;
    articleEditor: ArticleEditor;
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
            articleEditor: false,
            contextMenu: false,
        };
        makeAutoObservable(this, overrides);

        this.domain = domain;

        // central views
        this.home = new HomeManager(this);
        this.settingsEditor = new SettingsEditor(this);
        this.articleEditor = new ArticleEditor(this);

        // navbar
        this.navigation = new NavigationService(this);

        // modals
        this.projectCreator = new ProjectCreator();
        this.articleCreator = new ArticleCreator(this);

        // context menu
        this.contextMenu = new ContextMenuManager(this);
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
        this.navBarMobileOpen = !this.navBarMobileOpen;
    }

    openHome() {
        this.cleanUp(ViewKey.HOME);
        this.viewKey = ViewKey.HOME;
    }

    openSettings() {
        this.cleanUp(ViewKey.SETTINGS);
        this.viewKey = ViewKey.SETTINGS;
    }

    openProjectCreator() {
        this.projectCreator.initialize();
        this.modalKey = ModalKey.PROJECT_CREATOR;
    }

    openArticleCreator(entityType: EntityType | undefined = undefined) {
        this.articleCreator.initialize(entityType);
        this.modalKey = ModalKey.ARTICLE_CREATOR;
    }

    openArticleEditor(article: ArticleResponse<BaseEntity>) {
        if (
            this.viewKey == ViewKey.ARTICLE_EDITOR &&
            this.articleEditor.info.id == article.id
        )
            return; // the article is already open

        // save any unsynced data before opening another article
        this.cleanUp(ViewKey.ARTICLE_EDITOR);

        this.articleEditor.initialize(article);
        this.navigation.files.openArticleNode(article.id);
        this.viewKey = ViewKey.ARTICLE_EDITOR;
    }

    async openArticleEditorForId(id: number) {
        if (
            this.viewKey == ViewKey.ARTICLE_EDITOR &&
            this.articleEditor.info.id == id
        )
            return; // the article is already open

        const article = await this.domain.articles.get(id);
        if (article) this.openArticleEditor(article);
    }

    closeModal() {
        this.modalKey = null;
    }

    async createProject(name: string, dbFilePath: string) {
        // save any unsynced data before loading a new project
        this.cleanUp(this.viewKey);

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
        this.cleanUp(this.viewKey);

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
        this.cleanUp(this.viewKey);

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
            this.viewKey == ViewKey.ARTICLE_EDITOR &&
            fileIds.articles.includes(this.articleEditor.info.id)
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
            this.openArticleEditor(article);
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

    async deleteArticle(id: number, confirm: boolean = true) {
        if (confirm) {
            const article = this.domain.articles.getInfo(id);
            const canDelete = await ask(
                `Are you sure you want to delete the article for '${article.title}'? This action is irreversible.`,
                {
                    title: "Delete article",
                    kind: "warning",
                    okLabel: "Delete",
                },
            );
            if (!canDelete) return false;
        }

        const success = await this.domain.articles.delete(id);
        if (!success)
            // failed to delete the article; aborting
            return false;

        if (
            this.viewKey == ViewKey.ARTICLE_EDITOR &&
            this.articleEditor.info.id == id
        ) {
            // deleted article is currently open
            this.openHome();
        }

        this.navigation.files.deleteArticleNode(id);

        return true;
    }

    cleanUp(newViewKey: ViewKey | null = null) {
        if (this.modalKey) this.closeModal();

        if (this.viewKey == ViewKey.ARTICLE_EDITOR)
            this.articleEditor.cleanUp();

        if (
            isFileView(this.viewKey) &&
            (!newViewKey || !isFileView(newViewKey))
        ) {
            this.navigation.files.openedNode = null;
            this.navigation.files.selectedNode = null;
        }
    }
}

function isFileView(key: ViewKey) {
    return key == ViewKey.ARTICLE_EDITOR;
}
