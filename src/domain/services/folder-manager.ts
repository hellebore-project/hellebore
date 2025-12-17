import { invoke } from "@tauri-apps/api/core";

import { CommandNames, ROOT_FOLDER_ID } from "@/domain/constants";
import { Id } from "@/interface";
import {
    BulkFileResponse,
    DiagnosticResponse,
    FolderResponse,
    FolderUpdate,
    FolderUpdateResponse,
    FolderValidateResponse,
} from "@/domain/schema";

import { FileStructure } from "./file-structure";

export interface FolderUpdateArgs {
    id: number;
    name?: string | null;
    parentId?: number | null;
    oldParentId?: number | null;
}

export class FolderManager {
    _structure: FileStructure;

    constructor(structure: FileStructure) {
        this._structure = structure;
    }

    async create(name: string, parentId: number = ROOT_FOLDER_ID) {
        let response: FolderResponse | null;
        try {
            response = await this._create(parentId, name);
        } catch (error) {
            console.error(error);
            return null;
        }

        if (response) this._structure.addFolder(response);

        return response;
    }

    async validate(
        id: number | null,
        parentId: number,
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
        oldParentId = null,
    }: FolderUpdateArgs): Promise<FolderUpdateResponse | null> {
        const folderNode = this._structure.folders[id];

        const nameChanged = name !== null;
        const parentChanged =
            parentId !== null &&
            oldParentId !== null &&
            parentId != oldParentId;

        let response: FolderResponse | null;
        try {
            response = await this._update({ id, parentId, name });
        } catch (error) {
            console.error(error);
            return null;
        }

        if (parentChanged)
            this._structure.moveFolder(id, oldParentId, parentId);
        if (nameChanged) folderNode.name = name as string;

        return {
            ...response,
            parentChanged,
            nameChanged,
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

        this._structure.resetFolders();
        for (const folder of response) this._structure.addFolder(folder);

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

        this._structure.bulkDelete(response);

        return response;
    }

    async _create(parentId: Id, name: string): Promise<FolderResponse> {
        return invoke<FolderResponse>(CommandNames.Folder.Create, {
            info: { parentId, name },
        });
    }

    async _update(update: FolderUpdate): Promise<FolderResponse> {
        return invoke<FolderResponse>(CommandNames.Folder.Update, {
            folder: update,
        });
    }

    async _validate_name(
        id: Id | null,
        parentId: Id,
        name: string,
    ): Promise<DiagnosticResponse<FolderValidateResponse>> {
        return invoke<DiagnosticResponse<FolderValidateResponse>>(
            CommandNames.Folder.Validate,
            { id, parentId, name },
        );
    }

    async _get(id: Id) {
        return invoke<FolderResponse>(CommandNames.Folder.Get, { id });
    }

    async _getAll() {
        return invoke<FolderResponse[]>(CommandNames.Folder.GetAll);
    }

    async _delete(id: Id): Promise<BulkFileResponse> {
        return invoke<BulkFileResponse>(CommandNames.Folder.Delete, { id });
    }
}
