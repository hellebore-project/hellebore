import { makeAutoObservable } from "mobx";

import {
    ArticleResponse,
    BaseEntity,
    EntityType,
    ModalKey,
    ViewKey,
} from "@/interface";
import { ArticleCreatorService } from "./article-creator";
import { ArticleEditorService } from "./article-editing";
import { NavigationService } from "./navigation/navigation-service";
import { DomainService } from "./domain";
import { HomeService } from "./home-service";
import { SettingsEditorService } from "./settings-editor";
import { ProjectCreatorService } from "./project-creator";
import { open } from "@tauri-apps/plugin-dialog";
import { ArticleRemoverService } from "./article-remover";

export class ViewService {
    viewKey: ViewKey = ViewKey.HOME;
    modalKey: ModalKey | null = null;
    navBarMobileOpen: boolean = true;

    domain: DomainService;
    home: HomeService;
    projectCreator: ProjectCreatorService;
    articleCreator: ArticleCreatorService;
    articleRemover: ArticleRemoverService;
    articleEditor: ArticleEditorService;
    navigation: NavigationService;
    settingsEditor: SettingsEditorService;

    constructor(domain: DomainService) {
        const overrides = {
            domain: false,
            home: false,
            projectCreator: false,
            articleCreator: false,
            articleRemover: false,
            articleEditor: false,
            navigation: false,
            settingsEditor: false,
        };
        makeAutoObservable(this, overrides);

        this.domain = domain;

        // central views
        this.home = new HomeService(domain);
        this.settingsEditor = new SettingsEditorService(domain);
        this.articleEditor = new ArticleEditorService(domain, (id) =>
            this.openArticleEditorForId(id),
        );

        // navbar
        this.navigation = new NavigationService(this.domain);
        this.navigation.articles.onSelectedArticle.push((id) =>
            this.openArticleEditorForId(id),
        );
        this.domain.articles.onUpdated.push(({ id, title, isTitleUnique }) => {
            if (!title || title == "" || !isTitleUnique) return;
            this.navigation.articles.updateArticleNodeText(id, title);
        });

        // modals
        this.projectCreator = new ProjectCreatorService();
        this.articleCreator = new ArticleCreatorService(domain);
        this.articleRemover = new ArticleRemoverService();
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

    openProjectCreator() {
        this.cleanUp();
        this.projectCreator.initialize();
        this.modalKey = ModalKey.PROJECT_CREATOR;
    }

    openSettings() {
        this.cleanUp();
        this.viewKey = ViewKey.SETTINGS;
    }

    openArticleCreator(entityType: EntityType | undefined = undefined) {
        this.cleanUp();
        this.articleCreator.initialize(entityType);
        this.modalKey = ModalKey.ARTICLE_CREATOR;
    }

    openArticleRemover(id: number) {
        this.cleanUp();
        this.articleRemover.initialize(id);
        this.modalKey = ModalKey.ARTICLE_REMOVER;
    }

    openArticleEditor(article: ArticleResponse<BaseEntity>) {
        this.cleanUp();
        this.articleEditor.initialize(article);
        this.navigation.articles.selectArticleNode(article.id);
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
            const response = await this.domain.session.loadProject(path);
            if (response) {
                this.populateNavigator();
                this.home.initialize(response.name);
                this.openHome();
            }
        }
    }

    async closeProject() {
        const success = await this.domain.session.closeProject();
        if (success) {
            this.navigation.reset();
            this.home.initialize("");
            this.openHome();
        }
    }

    async createArticle() {
        let article = await this.articleCreator.createArticle(
            this.navigation.articles.activeFolderId,
        );
        if (article) {
            this.closeModal();
            this.navigation.articles.addNodeForCreatedArticle(article);
            this.openArticleEditor(article);
        }
    }

    async deleteArticle(id: number) {
        const success = await this.domain.articles.delete(id);
        if (!success)
            // failed to delete the article; aborting
            return;

        if (
            this.viewKey == ViewKey.ARTICLE_EDITOR &&
            this.articleEditor.info.id == id
        ) {
            // deleted article is currently open
            this.openHome();
        }

        this.navigation.articles.deleteArticleNode(id);
    }

    cleanUp() {
        if (this.modalKey) this.closeModal();
        if (this.viewKey == ViewKey.ARTICLE_EDITOR)
            this.articleEditor.cleanUp();
    }
}
