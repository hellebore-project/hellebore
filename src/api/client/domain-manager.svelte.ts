import { ProjectManager } from "./project-manager.svelte";
import { FolderManager } from "./folder-manager.svelte";
import { EntryManager } from "./entry-manager.svelte";
import { WordManager } from "./word-manager.svelte";

export class DomainManager {
    projects: ProjectManager;
    folders: FolderManager;
    entries: EntryManager;
    words: WordManager;

    constructor() {
        this.projects = new ProjectManager();
        this.folders = new FolderManager();
        this.entries = new EntryManager();
        this.words = new WordManager();
    }
}
