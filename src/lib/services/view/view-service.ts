import { open } from "@tauri-apps/plugin-dialog";
import { makeAutoObservable } from "mobx";

import {
    ArticleResponse,
    BaseEntity,
    EntityType,
    ModalKey,
    ViewKey,
} from "@/interface";
import { ArticleUpdateArguments, DomainService } from "../domain";
import { ArticleCreatorService } from "./article-creator";
import { ArticleEditorService } from "./article-editing";
import { ContextMenuService } from "./context-menu-manager";
import { DataRemoverService } from "./data-remover";
import { HomeService } from "./home-service";
import { NavigationService } from "./navigation/navigation-service";
import { ProjectCreatorService } from "./project-creator";
import { SettingsEditorService } from "./settings-editor";

export class ViewService {
    // state variables
    viewKey: ViewKey = ViewKey.HOME;
    modalKey: ModalKey | null = null;
    navBarMobileOpen: boolean = true;

    // domain service
    domain: DomainService;

    // central view services
    home: HomeService;
    articleEditor: ArticleEditorService;
    settingsEditor: SettingsEditorService;

    // navigation bar service
    navigation: NavigationService;

    // modal services
    projectCreator: ProjectCreatorService;
    articleCreator: ArticleCreatorService;
    articleRemover: DataRemoverService;
    folderRemover: DataRemoverService;

    // context menu service
    contextMenu: ContextMenuService;

    constructor(domain: DomainService) {
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

        const updateArticle = (update: ArticleUpdateArguments) =>
            this.updateArticle(update);

        this.domain = domain;

        // central views
        this.home = new HomeService(domain);
        this.settingsEditor = new SettingsEditorService(domain);
        this.articleEditor = new ArticleEditorService(
            domain,
            updateArticle,
            (id) => this.openArticleEditorForId(id),
        );

        // navbar
        this.navigation = new NavigationService(domain, updateArticle);
        this.navigation.files.onSelectedArticle.push((id) =>
            this.openArticleEditorForId(id),
        );

        // modals
        this.projectCreator = new ProjectCreatorService();
        this.folderRemover = new DataRemoverService();
        this.articleCreator = new ArticleCreatorService(domain);
        this.articleRemover = new DataRemoverService();

        // context menu
        this.contextMenu = new ContextMenuService();
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
        this.cleanUp();
        this.viewKey = ViewKey.HOME;
    }

    openSettings() {
        this.cleanUp();
        this.viewKey = ViewKey.SETTINGS;
    }

    openProjectCreator() {
        this.projectCreator.initialize();
        this.modalKey = ModalKey.PROJECT_CREATOR;
    }

    openFolderRemover(id: number) {
        this.folderRemover.initialize(id);
        this.modalKey = ModalKey.FOLDER_REMOVER;
    }

    openArticleCreator(entityType: EntityType | undefined = undefined) {
        this.articleCreator.initialize(entityType);
        this.modalKey = ModalKey.ARTICLE_CREATOR;
    }

    openArticleRemover(id: number) {
        this.articleRemover.initialize(id);
        this.modalKey = ModalKey.ARTICLE_REMOVER;
    }

    openArticleEditor(article: ArticleResponse<BaseEntity>) {
        this.articleEditor.initialize(article);
        this.navigation.files.selectArticleNode(article.id);
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
        this.cleanUp();

        const response = await this.domain.session.createProject(
            name,
            dbFilePath,
        );

        if (response) {
            this.populateNavigator();
            this.home.initialize(response.name);
            this.openHome();
        }
    }

    async loadProject() {
        const path = await open();
        if (path) {
            // save any unsynced data before loading another project
            this.cleanUp();

            const response = await this.domain.session.loadProject(path);
            if (response) {
                this.populateNavigator();
                this.home.initialize(response.name);
                this.openHome();
            }
        }
    }

    async closeProject() {
        // save any unsynced data before closing the project
        this.cleanUp();

        const success = await this.domain.session.closeProject();
        if (success) {
            this.navigation.reset();
            this.home.initialize("");
            this.openHome();
        }
    }

    async deleteFolder(id: number) {
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

    async deleteArticle(id: number) {
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

    cleanUp() {
        if (this.modalKey) this.closeModal();
        if (this.viewKey == ViewKey.ARTICLE_EDITOR)
            this.articleEditor.cleanUp();
    }
}
