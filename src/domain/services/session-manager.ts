import { invoke } from "@tauri-apps/api/core";
import { makeAutoObservable } from "mobx";

import { CommandNames, ProjectResponse, SessionResponse } from "@/domain";

export class SessionManager {
    private _dbFilePath: string | null = null;
    private _project: ProjectResponse | null = null;

    constructor() {
        // the UI depends on the project info, so it needs to be observable
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
            response = await this._getSession();
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
            response = await this._createProject(name, dbFilePath);
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
            response = await this._loadProject(dbFilePath);
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
            await this._closeProject();
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
            response = await this._updateProject(name);
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
        dbPath: string,
    ): Promise<ProjectResponse> {
        return invoke<ProjectResponse>(CommandNames.Project.Create, {
            name,
            dbPath,
        });
    }

    async _loadProject(dbPath: string): Promise<ProjectResponse> {
        return invoke<ProjectResponse>(CommandNames.Project.Load, { dbPath });
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
