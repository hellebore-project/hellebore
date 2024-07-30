import { makeAutoObservable } from "mobx";

import { ViewKey } from "./constants";
import { EntityType } from "../entities";
import ArticleCreatorService from "./article-creator-service";

class ViewService {
    viewKey: ViewKey = ViewKey.HOME;
    sideBarOpen: boolean = true;

    articleCreator: ArticleCreatorService;

    constructor() {
        makeAutoObservable(this, { articleCreator: false });
        this.articleCreator = new ArticleCreatorService();
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
}

export default ViewService;
