import { makeAutoObservable } from "mobx";

import { ArticleService } from "./article-service";

class DataService {
    articles: ArticleService;

    constructor() {
        makeAutoObservable(this, { articles: false });
        this.articles = new ArticleService();
    }
}

export default DataService;
