import { makeAutoObservable } from "mobx";

import { FolderManager } from "./folder-manager";
import { SessionManager } from "./session-manager";
import { DataManager } from "./data-manager";
import { FileStructure } from "./file-structure";
import { WordManager } from "./word-manager";
import { EntryManager } from "./entry-manager";

export class DomainManager {
    session: SessionManager;
    structure: FileStructure;
    data: DataManager;
    folders: FolderManager;
    entries: EntryManager;
    words: WordManager;

    constructor() {
        makeAutoObservable(this, {
            session: false,
            structure: false,
            data: false,
            folders: false,
            words: false,
        });
        this.session = new SessionManager();
        this.structure = new FileStructure();
        this.data = new DataManager(this.structure);
        this.folders = new FolderManager(this.data, this.structure);
        this.entries = new EntryManager(this.structure);
        this.words = new WordManager();
    }

    get hasProject() {
        return this.session.project !== null;
    }

    get projectName() {
        return this.session.project?.name ?? null;
    }
}
