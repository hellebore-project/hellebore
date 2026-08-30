import { invoke } from "@tauri-apps/api/core";

import { CommandNames } from "../constants";
import type { ProjectResponse, ProjectUpdate } from "../interface";

export class ProjectManager {
    async createProject(name: string, folderPath: string) {
        let response: ProjectResponse | null;
        try {
            response = await invoke<ProjectResponse>(
                CommandNames.Project.Create,
                {
                    name,
                    folderPath,
                    inMemory: false,
                },
            );
        } catch (error) {
            console.error(error);
            return null;
        }
        return response;
    }

    async loadProject(folderPath?: string | null) {
        let response: ProjectResponse | null;
        try {
            response = await invoke<ProjectResponse>(
                CommandNames.Project.Load,
                {
                    folderPath: folderPath ?? null,
                },
            );
        } catch (error) {
            console.error(error);
            return null;
        }
        return response;
    }

    async closeProject(id: string) {
        try {
            await invoke<void>(CommandNames.Project.Close, { id });
        } catch (error) {
            console.error(error);
            return false;
        }
        return true;
    }

    async updateProject({ id, name = null }: ProjectUpdate) {
        if (name === null) return null;

        let response: ProjectResponse | null;
        try {
            // TODO: the update project endpoint should support null fields
            response = await invoke<ProjectResponse>(
                CommandNames.Project.Update,
                {
                    id,
                    name,
                },
            );
        } catch (error) {
            console.error(error);
            return null;
        }
        return response;
    }
}
