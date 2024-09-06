import { makeAutoObservable } from "mobx";

import { ArticleService } from "./article-service";
import { FolderService } from "./folder-service";

export class DomainService {
    articles: ArticleService;
    folders: FolderService;

    constructor() {
        makeAutoObservable(this, { articles: false });
        this.articles = new ArticleService();
        this.folders = new FolderService();
    }
}
