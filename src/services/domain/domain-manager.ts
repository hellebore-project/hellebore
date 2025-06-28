import { makeAutoObservable } from "mobx";

import { ArticleManager } from "./article-manager";
import { FolderManager } from "./folder-manager";
import { SessionManager } from "./session-manager";
import { DataManager } from "./data-manager";
import { FileStructure } from "./file-structure";
import { WordManager } from "./word-manager";
import { EntityManager } from "./entity-manager";

export class DomainManager {
    session: SessionManager;
    structure: FileStructure;
    data: DataManager;
    folders: FolderManager;
    entities: EntityManager;
    articles: ArticleManager;
    words: WordManager;

    constructor() {
        makeAutoObservable(this, {
            session: false,
            structure: false,
            data: false,
            folders: false,
            articles: false,
            words: false,
        });
        this.session = new SessionManager();
        this.structure = new FileStructure();
        this.data = new DataManager(this.structure);
        this.folders = new FolderManager(this.data, this.structure);
        this.entities = new EntityManager(this.structure);
        this.articles = new ArticleManager(this.structure);
        this.words = new WordManager();
    }

    get hasProject() {
        return this.session.project !== null;
    }

    get projectName() {
        return this.session.project?.name ?? null;
    }
}
