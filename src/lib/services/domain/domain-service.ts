import { makeAutoObservable } from "mobx";

import { ArticleService } from "./article-manager";
import { FolderService } from "./folder-manager";
import { ProjectService } from "./project-manager";

export class DomainService {
    project: ProjectService;
    articles: ArticleService;
    folders: FolderService;

    constructor() {
        makeAutoObservable(this, {
            project: false,
            articles: false,
            folders: false,
        });
        this.project = new ProjectService();
        this.articles = new ArticleService();
        this.folders = new FolderService();
    }
}
