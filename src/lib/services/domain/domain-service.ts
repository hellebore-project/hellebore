import { makeAutoObservable } from "mobx";

import { ArticleService } from "./article-manager";
import { FolderService } from "./folder-manager";

export class DomainService {
    articles: ArticleService;
    folders: FolderService;

    constructor() {
        makeAutoObservable(this, { articles: false });
        this.articles = new ArticleService();
        this.folders = new FolderService();
    }
}
