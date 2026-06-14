import { ProjectManager } from "./project-manager.svelte";
import { FolderManager } from "./folder-manager.svelte";
import { EntryManager } from "./entry-manager.svelte";
import { WordManager } from "./word-manager.svelte";

export class ProjectDataManager {
    private _projectId: string;
    folders: FolderManager;
    entries: EntryManager;
    words: WordManager;

    constructor(projectId: string) {
        this._projectId = projectId;
        this.folders = new FolderManager(projectId);
        this.entries = new EntryManager(projectId);
        this.words = new WordManager(projectId);
    }

    get projectId() {
        return this._projectId;
    }

    set projectId(id: string) {
        this._projectId = id;
        this.folders = new FolderManager(id);
        this.entries = new EntryManager(id);
        this.words = new WordManager(id);
    }
}

export class DomainManager {
    projects: ProjectManager;
    _loadedProject: ProjectDataManager | null = null;

    constructor() {
        this.projects = new ProjectManager();
    }

    get loadedProjectId() {
        return this._loadedProject?.projectId ?? null;
    }

    set loadedProjectId(id: string | null) {
        if (id === null) {
            this._loadedProject = null;
        } else {
            this._loadedProject = new ProjectDataManager(id);
        }
    }

    get loadedProject() {
        if (!this._loadedProject) {
            console.error("No project is currently loaded.");
            throw new Error("No project is currently loaded.");
        }
        return this._loadedProject;
    }

    project(id: string): ProjectDataManager {
        return new ProjectDataManager(id);
    }
}
