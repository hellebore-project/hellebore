import { makeAutoObservable } from "mobx";

import {
    ArticleResponse,
    BaseEntity,
    EntityType,
    ModalKey,
    ViewKey,
} from "../interface";
import { ArticleCreatorService } from "./article-creator-service";
import { ArticleEditorService } from "./article-editing";
import { NavigationService } from "./navigation/navigation-service";
import { DomainService } from "./domain";

export class ViewService {
    viewKey: ViewKey = ViewKey.HOME;
    modalKey: ModalKey | null = null;
    sideBarOpen: boolean = true;

    domain: DomainService;
    articleCreator: ArticleCreatorService;
    articleEditor: ArticleEditorService;
    navigation: NavigationService;

    constructor(domain: DomainService) {
        const overrides = {
            data: false,
            articleCreator: false,
            articleEditor: false,
            navigation: false,
        };
        makeAutoObservable(this, overrides);

        this.domain = domain;

        this.articleCreator = new ArticleCreatorService(domain);

        this.articleEditor = new ArticleEditorService(domain, (id) =>
            this.openArticleEditorForId(id),
        );

        this.navigation = new NavigationService(this.domain);
        this.navigation.articles.onSelectedArticle.push((id) =>
            this.openArticleEditorForId(id),
        );

        this.domain.articles.onUpdated.push(({ id, title, isTitleUnique }) => {
            if (!title || title == "" || !isTitleUnique) return;
            this.navigation.articles.updateArticleNodeText(id, title);
        });
    }

    async populateNavigator() {
        const articles = await this.domain.articles.getAll();
        const folders = await this.domain.folders.getAll();

        if (articles && folders)
            this.navigation.articles.setup(articles, folders);
    }

    toggleSideBar() {
        this.sideBarOpen = !this.sideBarOpen;
    }

    openHome() {
        this.cleanUp();
        this.viewKey = ViewKey.HOME;
        this.articleCreator;
    }

    openArticleCreator(entityType: EntityType | undefined = undefined) {
        this.cleanUp();
        this.articleCreator.initialize(entityType);
        this.modalKey = ModalKey.ARTICLE_CREATOR;
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

    cleanUp() {
        if (this.viewKey == ViewKey.ARTICLE_EDITOR)
            this.articleEditor.cleanUp();
    }
}
