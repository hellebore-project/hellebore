import { invoke } from "@tauri-apps/api/core";
import { makeAutoObservable } from "mobx";

import { ProjectResponse, SessionResponse } from "@/interface";

export class SessionService {
    info: SessionResponse;

    constructor() {
        makeAutoObservable(this);
        this.info = {
            db_file_path: "",
            project: {
                id: 0,
                name: "",
            },
        };
    }

    async getSession() {
        let response: SessionResponse | null;
        try {
            response = await getSession();
        } catch (error) {
            console.error(error);
            return null;
        }
        this.info = response;
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
        return response;
    }

    async loadProject(db_file_path: string) {
        let response: ProjectResponse | null;
        try {
            response = await loadProject(db_file_path);
        } catch (error) {
            console.error(error);
            return null;
        }
        return response;
    }

    async updateProject(name: string) {
        let response: ProjectResponse | null;
        try {
            response = await updateProject(name);
        } catch (error) {
            console.error(error);
            return null;
        }
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

async function updateProject(name: string): Promise<ProjectResponse> {
    return invoke<ProjectResponse>("update_project", { name });
}

async function getProject(): Promise<ProjectResponse> {
    return invoke<ProjectResponse>("get_project");
}
