import { invoke } from "@tauri-apps/api/core";

import type { Id } from "@/interface";

import { CommandNames, ROOT_FOLDER_ID } from "../constants";
import type {
    BulkEntityResponse,
    DiagnosticResponse,
    FolderBulkUpdateData,
    FolderResponse,
    FolderUpdate,
    FolderUpdateResponse,
    FolderValidateResponse,
} from "../interface";

export class FolderManager {
    async create(projectId: Id, name: string, parentId: Id = ROOT_FOLDER_ID) {
        let response: FolderResponse | null;
        try {
            response = await invoke<FolderResponse>(
                CommandNames.Folder.Create,
                {
                    projectId,
                    folder: { parentId, name },
                },
            );
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
            response = await invoke<DiagnosticResponse<FolderValidateResponse>>(
                CommandNames.Folder.Validate,
                { projectId, id, parentId, name },
            );
        } catch (error) {
            console.error(error);
            return null;
        }

        return response.data;
    }

    async update(
        projectId: Id,
        folder: FolderUpdate,
    ): Promise<FolderUpdateResponse | null> {
        let response: DiagnosticResponse<FolderBulkUpdateData>;
        try {
            response = await invoke<DiagnosticResponse<FolderBulkUpdateData>>(
                CommandNames.Folder.Update,
                {
                    projectId,
                    folder,
                },
            );
        } catch (error) {
            console.error(error);
            return null;
        }

        return {
            id: response.data.id,
            parentId: folder.parentId ?? null,
            name: folder.name ?? null,
            parentChanged: response.data.parentChanged,
            nameChanged: response.data.nameChanged,
        };
    }

    async bulkUpdate(
        projectId: Id,
        folders: FolderUpdate[],
    ): Promise<FolderUpdateResponse[] | null> {
        let responses: DiagnosticResponse<FolderBulkUpdateData>[];

        try {
            responses = await invoke<
                DiagnosticResponse<FolderBulkUpdateData>[]
            >(CommandNames.Folder.BulkUpdate, { projectId, folders });
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

    async get(projectId: Id, id: Id): Promise<FolderResponse | null> {
        let response: FolderResponse | null;
        try {
            response = await invoke<FolderResponse>(CommandNames.Folder.Get, {
                projectId,
                id,
            });
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
            response = await invoke<FolderResponse[]>(
                CommandNames.Folder.List,
                {
                    projectId,
                },
            );
        } catch (error) {
            console.error(error);
            console.error("Failed to fetch all folders from the backend.");
            return null;
        }

        return response;
    }

    async delete(projectId: Id, id: Id): Promise<BulkEntityResponse | null> {
        let response: BulkEntityResponse;
        try {
            response = await invoke<BulkEntityResponse>(
                CommandNames.Folder.Delete,
                {
                    projectId,
                    id,
                },
            );
        } catch (error) {
            console.error(error);
            console.error(`Failed to delete folder ${id} and/or its contents.`);
            return null;
        }

        return response;
    }
}
