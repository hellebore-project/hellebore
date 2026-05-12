import { FolderManager } from "./folder-manager.svelte";
import { EntryManager } from "./entry-manager.svelte";
import { SessionManager } from "./session-manager.svelte";
import { WordManager } from "./word-manager.svelte";

export class DomainManager {
    session: SessionManager;
    folders: FolderManager;
    entries: EntryManager;
    words: WordManager;

    constructor() {
        this.session = new SessionManager();
        this.folders = new FolderManager();
        this.entries = new EntryManager();
        this.words = new WordManager();
    }
}
