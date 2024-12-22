import { invoke } from "@tauri-apps/api/core";
import { makeAutoObservable } from "mobx";

import { ProjectResponse } from "@/interface";

export class ProjectService {
    constructor() {
        makeAutoObservable(this);
    }

    async update(name: string) {
        let response: ProjectResponse | null;
        try {
            response = await updateProject(name);
        } catch (error) {
            console.error(error);
            return null;
        }
        return response;
    }

    async get() {
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

async function updateProject(name: string): Promise<ProjectResponse> {
    return invoke<ProjectResponse>("update_project", { name });
}

async function getProject(): Promise<ProjectResponse> {
    return invoke<ProjectResponse>("get_project");
}
