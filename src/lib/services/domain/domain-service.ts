import { makeAutoObservable } from "mobx";

import { ArticleService } from "./article-manager";
import { FolderService } from "./folder-manager";
import { SessionService } from "./session-manager";
import { DataManager } from "./data-manager";
import { FileStructure } from "./file-structure";

export class DomainService {
    session: SessionService;
    structure: FileStructure;
    data: DataManager;
    folders: FolderService;
    articles: ArticleService;

    constructor() {
        makeAutoObservable(this, {
            session: false,
            structure: false,
            data: false,
            folders: false,
            articles: false,
        });
        this.session = new SessionService();
        this.structure = new FileStructure();
        this.data = new DataManager(this.structure);
        this.folders = new FolderService(this.data, this.structure);
        this.articles = new ArticleService(this.structure);
    }

    get hasProject() {
        return this.session.project !== null;
    }

    get projectName() {
        return this.session.project?.name ?? null;
    }
}
