import { makeAutoObservable } from "mobx";

import { ViewKey } from "./constants";
import { EntityType, IdentifiedEntity } from "../interface/entities";
import ArticleCreatorService from "./article-creator-service";
import ArticleEditorService from "./article-editor-service";
import { Article } from "../interface";

class ViewService {
    viewKey: ViewKey = ViewKey.HOME;
    sideBarOpen: boolean = true;

    articleCreator: ArticleCreatorService;
    articleEditor: ArticleEditorService;

    constructor() {
        const overrides = {
            articleCreator: false,
            articleEditor: false,
        };
        makeAutoObservable(this, overrides);
        this.articleCreator = new ArticleCreatorService();
        this.articleEditor = new ArticleEditorService();
    }

    toggleSideBar() {
        this.sideBarOpen = !this.sideBarOpen;
    }

    openHome() {
        this.viewKey = ViewKey.HOME;
        this.articleCreator;
    }

    openArticleCreator(entityType: EntityType | undefined = undefined) {
        this.viewKey = ViewKey.ARTICLE_CREATOR;
        this.articleCreator.reset(entityType);
    }

    openArticleEditor(article: Article<IdentifiedEntity>) {
        this.viewKey = ViewKey.ARTICLE_EDITOR;
        this.articleEditor.initialize(article);
    }
}

export default ViewService;
