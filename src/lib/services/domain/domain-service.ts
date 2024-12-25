import { makeAutoObservable } from "mobx";

import { ArticleService } from "./article-manager";
import { FolderService } from "./folder-manager";
import { SessionService } from "./session-manager";

export class DomainService {
    session: SessionService;
    folders: FolderService;
    articles: ArticleService;

    constructor() {
        makeAutoObservable(this, {
            session: false,
            folders: false,
            articles: false,
        });
        this.session = new SessionService();
        this.folders = new FolderService();
        this.articles = new ArticleService();
    }
}
