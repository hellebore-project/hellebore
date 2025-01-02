import { invoke } from "@tauri-apps/api/core";
import { makeAutoObservable } from "mobx";

import { ProjectResponse, SessionResponse } from "@/interface";

export class SessionManager {
    _dbFilePath: string | null = null;
    _project: ProjectResponse | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    get project() {
        return this._project;
    }

    set project(project: ProjectResponse | null) {
        this._project = project;
    }

    get dbFilePath() {
        return this._dbFilePath;
    }

    set dbFilePath(dbFilePath: string | null) {
        this._dbFilePath = dbFilePath;
    }

    async getSession() {
        let response: SessionResponse | null;
        try {
            response = await getSession();
        } catch (error) {
            console.error(error);
            return null;
        }
        this.project = response.project;
        this.dbFilePath = response.db_file_path;
        return response;
    }

    async createProject(name: string, dbFilePath: string) {
        let response: ProjectResponse | null;
        try {
            response = await createProject(name, dbFilePath);
        } catch (error) {
            console.error(error);
            return null;
        }
        this.project = response;
        this.dbFilePath = dbFilePath;
        return response;
    }

    async loadProject(dbFilePath: string) {
        let response: ProjectResponse | null;
        try {
            response = await loadProject(dbFilePath);
        } catch (error) {
            console.error(error);
            return null;
        }
        this.project = response;
        this.dbFilePath = dbFilePath;
        return response;
    }

    async closeProject() {
        try {
            await closeProject();
        } catch (error) {
            console.error(error);
            return false;
        }
        this.project = null;
        this.dbFilePath = null;
        return true;
    }

    async updateProject(name: string) {
        let response: ProjectResponse | null;
        try {
            response = await updateProject(name);
        } catch (error) {
            console.error(error);
            return null;
        }
        this.project = response;
        return response;
    }

    async getProject() {
        let response: ProjectResponse | null;
        try {
            response = await getProject();
        } catch (error) {
            console.error(error);
            return null;
        }
        return response;
    }
}

async function getSession(): Promise<SessionResponse> {
    return invoke<SessionResponse>("get_session");
}

async function createProject(
    name: string,
    dbPath: string,
): Promise<ProjectResponse> {
    return invoke<ProjectResponse>("create_project", { name, dbPath });
}

async function loadProject(dbPath: string): Promise<ProjectResponse> {
    return invoke<ProjectResponse>("load_project", { dbPath });
}

async function closeProject(): Promise<void> {
    return invoke<void>("close_project");
}

async function updateProject(name: string): Promise<ProjectResponse> {
    return invoke<ProjectResponse>("update_project", { name });
}

async function getProject(): Promise<ProjectResponse> {
    return invoke<ProjectResponse>("get_project");
}
