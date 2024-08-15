import { makeAutoObservable } from "mobx";

import { ViewKey } from "./constants";
import { EntityType, IdentifiedEntity } from "../interface/entities";
import ArticleCreatorService from "./article-creator-service";
import ArticleEditorService from "./article-editor-service";
import { Article } from "../interface";
import NavigationService from "./navigation-service";
import { getArticle } from "./data-service";

class ViewService {
    viewKey: ViewKey = ViewKey.HOME;
    sideBarOpen: boolean = true;

    articleCreator: ArticleCreatorService;
    articleEditor: ArticleEditorService;
    navigation: NavigationService;

    constructor() {
        const overrides = {
            articleCreator: false,
            articleEditor: false,
            navigation: false,
        };
        makeAutoObservable(this, overrides);
        this.articleCreator = new ArticleCreatorService();
        this.articleEditor = new ArticleEditorService();
        this.navigation = new NavigationService();
    }

    toggleSideBar() {
        this.sideBarOpen = !this.sideBarOpen;
    }

    openHome() {
        this.viewKey = ViewKey.HOME;
        this.articleCreator;
    }

    openArticleCreator(entityType: EntityType | undefined = undefined) {
        this.articleCreator.initialize(entityType);
        this.viewKey = ViewKey.ARTICLE_CREATOR;
    }

    openArticleEditor(article: Article<IdentifiedEntity>) {
        this.articleEditor.initialize(article);
        this.viewKey = ViewKey.ARTICLE_EDITOR;
    }

    async openArticleEditorForId(
        id: number,
        entityType: EntityType | null | undefined,
    ) {
        if (
            this.viewKey == ViewKey.ARTICLE_EDITOR &&
            this.articleEditor.id == id
        )
            return; // the article is already open

        let article: Article<IdentifiedEntity> | null = null;
        try {
            article = await getArticle(id, entityType);
        } catch (error) {
            console.error(error);
        }

        if (article) this.openArticleEditor(article);
    }

    async createArticle() {
        let article = await this.articleCreator.createArticle();
        if (article) {
            this.navigation.addArticleNodes([article]);
            this.openArticleEditor(article);
        }
    }
}

export default ViewService;
