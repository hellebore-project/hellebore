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
    async create(projectId: Id, name: string, parentId: Id = ROOT_FOLDER_ID) {
        let response: FolderResponse | null;
        try {
            response = await this._create(projectId, parentId, name);
        } catch (error) {
            console.error(error);
            return null;
        }

        return response;
    }

    async validate(
        projectId: Id,
        id: Id | null,
        parentId: Id,
        name: string,
    ): Promise<FolderValidateResponse | null> {
        let response: DiagnosticResponse<FolderValidateResponse> | null;
        try {
            response = await this._validate_name(projectId, id, parentId, name);
        } catch (error) {
            console.error(error);
            return null;
        }

        return response.data;
    }

    async update({
        projectId,
        id,
        name = null,
        parentId = null,
    }: FolderUpdateArgs & {
        projectId: Id;
    }): Promise<FolderUpdateResponse | null> {
        let response: DiagnosticResponse<FolderBulkUpdateData>;
        try {
            response = await this._update(projectId, { id, parentId, name });
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

    async get(projectId: Id, id: Id): Promise<FolderResponse | null> {
        let response: FolderResponse | null;
        try {
            response = await this._get(projectId, id);
        } catch (error) {
            console.error(error);
            console.error(`Failed to fetch folder ${id} from the backend.`);
            return null;
        }

        return response;
    }

    async getAll(projectId: Id): Promise<FolderResponse[] | null> {
        let response: FolderResponse[] | null;
        try {
            response = await this._getAll(projectId);
        } catch (error) {
            console.error(error);
            console.error("Failed to fetch all folders from the backend.");
            return null;
        }

        return response;
    }

    async delete(projectId: Id, id: Id): Promise<BulkFileResponse | null> {
        let response: BulkFileResponse;
        try {
            response = await this._delete(projectId, id);
        } catch (error) {
            console.error(error);
            console.error(`Failed to delete folder ${id} and/or its contents.`);
            return null;
        }

        return response;
    }

    async bulkUpdate(
        projectId: Id,
        folders: FolderUpdate[],
    ): Promise<FolderUpdateResponse[] | null> {
        let responses: DiagnosticResponse<FolderBulkUpdateData>[];

        try {
            responses = await this._bulkUpdate(projectId, folders);
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

    async _create(
        projectId: Id,
        parentId: Id,
        name: string,
    ): Promise<FolderResponse> {
        return invoke<FolderResponse>(CommandNames.Folder.Create, {
            projectId,
            info: { parentId, name },
        });
    }

    async _update(
        projectId: Id,
        update: FolderUpdate,
    ): Promise<DiagnosticResponse<FolderBulkUpdateData>> {
        return invoke<DiagnosticResponse<FolderBulkUpdateData>>(
            CommandNames.Folder.Update,
            {
                projectId,
                folder: update,
            },
        );
    }

    async _validate_name(
        projectId: Id,
        id: Id | null,
        parentId: Id,
        name: string,
    ): Promise<DiagnosticResponse<FolderValidateResponse>> {
        return invoke<DiagnosticResponse<FolderValidateResponse>>(
            CommandNames.Folder.Validate,
            { projectId, id, parentId, name },
        );
    }

    async _get(projectId: Id, id: Id) {
        return invoke<FolderResponse>(CommandNames.Folder.Get, {
            projectId,
            id,
        });
    }

    async _getAll(projectId: Id) {
        return invoke<FolderResponse[]>(CommandNames.Folder.GetAll, {
            projectId,
        });
    }

    async _delete(projectId: Id, id: Id): Promise<BulkFileResponse> {
        return invoke<BulkFileResponse>(CommandNames.Folder.Delete, {
            projectId,
            id,
        });
    }

    async _bulkUpdate(
        projectId: Id,
        folders: FolderUpdate[],
    ): Promise<DiagnosticResponse<FolderBulkUpdateData>[]> {
        return invoke<DiagnosticResponse<FolderBulkUpdateData>[]>(
            CommandNames.Folder.BulkUpdate,
            { projectId, folders },
        );
    }
}
