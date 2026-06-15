import { invoke } from "@tauri-apps/api/core";

import type { Id } from "@/interface";

import { CommandNames, ROOT_FOLDER_ID } from "../constants";
import type {
    BulkFileResponse,
    DiagnosticResponse,
    FolderBulkUpdateData,
    FolderResponse,
    FolderUpdate,
    FolderUpdateResponse,
    FolderValidateResponse,
} from "../interface";

export interface FolderUpdateArgs {
    id: Id;
    name?: string | null;
    parentId?: Id | null;
    oldParentId?: Id | null;
}

export class FolderManager {
    private _projectId: string;

    constructor(projectId: string) {
        this._projectId = projectId;
    }

    async create(name: string, parentId: Id = ROOT_FOLDER_ID) {
        let response: FolderResponse | null;
        try {
            response = await this._create(parentId, name);
        } catch (error) {
            console.error(error);
            return null;
        }

        return response;
    }

    async validate(
        id: Id | null,
        parentId: Id,
        name: string,
    ): Promise<FolderValidateResponse | null> {
        let response: DiagnosticResponse<FolderValidateResponse> | null;
        try {
            response = await this._validate_name(id, parentId, name);
        } catch (error) {
            console.error(error);
            return null;
        }

        return response.data;
    }

    async update({
        id,
        name = null,
        parentId = null,
    }: FolderUpdateArgs): Promise<FolderUpdateResponse | null> {
        let response: DiagnosticResponse<FolderBulkUpdateData>;
        try {
            response = await this._update({ id, parentId, name });
        } catch (error) {
            console.error(error);
            return null;
        }

        return {
            id: response.data.id,
            parentId,
            name,
            parentChanged: response.data.parentChanged,
            nameChanged: response.data.nameChanged,
        };
    }

    async get(id: Id): Promise<FolderResponse | null> {
        let response: FolderResponse | null;
        try {
            response = await this._get(id);
        } catch (error) {
            console.error(error);
            console.error(`Failed to fetch folder ${id} from the backend.`);
            return null;
        }

        return response;
    }

    async getAll(): Promise<FolderResponse[] | null> {
        let response: FolderResponse[] | null;
        try {
            response = await this._getAll();
        } catch (error) {
            console.error(error);
            console.error("Failed to fetch all folders from the backend.");
            return null;
        }

        return response;
    }

    async delete(id: Id): Promise<BulkFileResponse | null> {
        let response: BulkFileResponse;
        try {
            response = await this._delete(id);
        } catch (error) {
            console.error(error);
            console.error(`Failed to delete folder ${id} and/or its contents.`);
            return null;
        }

        return response;
    }

    async bulkUpdate(
        folders: FolderUpdate[],
    ): Promise<FolderUpdateResponse[] | null> {
        let responses: DiagnosticResponse<FolderBulkUpdateData>[];

        try {
            responses = await this._bulkUpdate(folders);
        } catch (error) {
            console.error(error);
            return null;
        }

        return responses.map((r, i) => ({
            ...folders[i],
            parentChanged: r.data.parentChanged,
            nameChanged: r.data.nameChanged,
        }));
    }

    async _create(parentId: Id, name: string): Promise<FolderResponse> {
        return invoke<FolderResponse>(CommandNames.Folder.Create, {
            projectId: this._projectId,
            info: { parentId, name },
        });
    }

    async _update(
        update: FolderUpdate,
    ): Promise<DiagnosticResponse<FolderBulkUpdateData>> {
        return invoke<DiagnosticResponse<FolderBulkUpdateData>>(
            CommandNames.Folder.Update,
            {
                projectId: this._projectId,
                folder: update,
            },
        );
    }

    async _validate_name(
        id: Id | null,
        parentId: Id,
        name: string,
    ): Promise<DiagnosticResponse<FolderValidateResponse>> {
        return invoke<DiagnosticResponse<FolderValidateResponse>>(
            CommandNames.Folder.Validate,
            { projectId: this._projectId, id, parentId, name },
        );
    }

    async _get(id: Id) {
        return invoke<FolderResponse>(CommandNames.Folder.Get, {
            projectId: this._projectId,
            id,
        });
    }

    async _getAll() {
        return invoke<FolderResponse[]>(CommandNames.Folder.GetAll, {
            projectId: this._projectId,
        });
    }

    async _delete(id: Id): Promise<BulkFileResponse> {
        return invoke<BulkFileResponse>(CommandNames.Folder.Delete, {
            projectId: this._projectId,
            id,
        });
    }

    async _bulkUpdate(
        folders: FolderUpdate[],
    ): Promise<DiagnosticResponse<FolderBulkUpdateData>[]> {
        return invoke<DiagnosticResponse<FolderBulkUpdateData>[]>(
            CommandNames.Folder.BulkUpdate,
            { projectId: this._projectId, folders },
        );
    }
}
