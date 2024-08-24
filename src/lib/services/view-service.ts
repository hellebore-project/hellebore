import { makeAutoObservable } from "mobx";

import { ViewKey } from "./constants";
import { EntityType, ArticleData } from "../interface";
import ArticleCreatorService from "./article-creator-service";
import ArticleEditorService from "./article-editor-service";
import { ArticleResponse } from "../interface";
import NavigationService from "./navigation-service";
import { DataService } from "./data-service";

class ViewService {
    viewKey: ViewKey = ViewKey.HOME;
    sideBarOpen: boolean = true;

    data: DataService;
    articleCreator: ArticleCreatorService;
    articleEditor: ArticleEditorService;
    navigation: NavigationService;

    constructor(dataService: DataService) {
        const overrides = {
            data: false,
            articleCreator: false,
            articleEditor: false,
            navigation: false,
        };
        makeAutoObservable(this, overrides);

        this.data = dataService;
        this.articleCreator = new ArticleCreatorService(dataService);
        this.articleEditor = new ArticleEditorService(dataService);
        this.navigation = new NavigationService();

        this.data.articles.onFetchedAll.push((infos) =>
            this.navigation.setupArticleNodes(infos),
        );
        this.data.articles.onUpdated.push((articleUpdate) =>
            this.navigation.updateArticleNode(articleUpdate),
        );
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
        this.viewKey = ViewKey.ARTICLE_CREATOR;
    }

    openArticleEditor(article: ArticleResponse<ArticleData>) {
        this.cleanUp();
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

        const article = await this.data.articles.get(id, entityType);
        if (article) this.openArticleEditor(article);
    }

    async createArticle() {
        let article = await this.articleCreator.createArticle();
        if (article) {
            this.navigation.addArticleNode(article);
            this.openArticleEditor(article);
        }
    }

    cleanUp() {
        if (this.viewKey == ViewKey.ARTICLE_EDITOR)
            this.articleEditor.cleanUp();
    }
}

export default ViewService;
