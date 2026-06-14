import { invoke } from "@tauri-apps/api/core";

import { CommandNames } from "../constants";
import type { ProjectResponse, ProjectUpdate } from "../interface";

export class ProjectManager {
    async createProject(name: string, folderPath: string) {
        let response: ProjectResponse | null;
        try {
            response = await this._createProject(name, folderPath);
        } catch (error) {
            console.error(error);
            return null;
        }
        return response;
    }

    async loadProject(folderPath?: string | null) {
        let response: ProjectResponse | null;
        try {
            response = await this._loadProject(folderPath ?? null);
        } catch (error) {
            console.error(error);
            return null;
        }
        return response;
    }

    async closeProject(id: string) {
        try {
            await this._closeProject(id);
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
            response = await this._updateProject(id, name);
        } catch (error) {
            console.error(error);
            return null;
        }
        return response;
    }

    async _createProject(
        name: string,
        folderPath: string,
    ): Promise<ProjectResponse> {
        return invoke<ProjectResponse>(CommandNames.Project.Create, {
            name,
            folderPath,
            inMemory: false,
        });
    }

    async _loadProject(folderPath: string | null): Promise<ProjectResponse> {
        return invoke<ProjectResponse>(CommandNames.Project.Load, {
            folderPath,
        });
    }

    async _closeProject(id: string): Promise<void> {
        return invoke<void>(CommandNames.Project.Close, { id });
    }

    async _updateProject(id: string, name: string): Promise<ProjectResponse> {
        return invoke<ProjectResponse>(CommandNames.Project.Update, {
            id,
            name,
        });
    }
}
