import { invoke } from "@tauri-apps/api/core";

import { CommandNames } from "@/constants";
import type {
    ProjectResponse,
    ProjectUpdate,
    SessionResponse,
} from "@/interface";

export class SessionManager {
    async getSession() {
        let response: SessionResponse | null;
        try {
            response = await this._getSession();
        } catch (error) {
            console.error(error);
            return null;
        }
        return response;
    }

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

    async loadProject(folderPath: string) {
        let response: ProjectResponse | null;
        try {
            response = await this._loadProject(folderPath);
        } catch (error) {
            console.error(error);
            return null;
        }
        return response;
    }

    async closeProject() {
        try {
            await this._closeProject();
        } catch (error) {
            console.error(error);
            return false;
        }
        return true;
    }

    async updateProject({ name = null }: ProjectUpdate) {
        if (name === null) return null;

        let response: ProjectResponse | null;
        try {
            // TODO: the update project endpoint should support null fields
            response = await this._updateProject(name);
        } catch (error) {
            console.error(error);
            return null;
        }
        return response;
    }

    async getProject() {
        let response: ProjectResponse | null;
        try {
            response = await this._getProject();
        } catch (error) {
            console.error(error);
            return null;
        }
        return response;
    }

    async _getSession(): Promise<SessionResponse> {
        return invoke<SessionResponse>(CommandNames.Session.Get);
    }

    async _createProject(
        name: string,
        folderPath: string,
    ): Promise<ProjectResponse> {
        return invoke<ProjectResponse>(CommandNames.Project.Create, {
            name,
            folderPath,
        });
    }

    async _loadProject(folderPath: string): Promise<ProjectResponse> {
        return invoke<ProjectResponse>(CommandNames.Project.Load, {
            folderPath,
        });
    }

    async _closeProject(): Promise<void> {
        return invoke<void>(CommandNames.Project.Close);
    }

    async _updateProject(name: string): Promise<ProjectResponse> {
        return invoke<ProjectResponse>(CommandNames.Project.Update, { name });
    }

    async _getProject(): Promise<ProjectResponse> {
        return invoke<ProjectResponse>(CommandNames.Project.Get);
    }
}
