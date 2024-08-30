import { makeAutoObservable } from "mobx";

import { ArticleService } from "./article-service";

export class DomainService {
    articles: ArticleService;

    constructor() {
        makeAutoObservable(this, { articles: false });
        this.articles = new ArticleService();
    }
}
