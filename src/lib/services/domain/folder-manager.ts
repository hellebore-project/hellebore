import { invoke } from "@tauri-apps/api/core";
import { makeAutoObservable } from "mobx";

import {
    FolderResponse,
    FolderUpdate,
    FolderValidateResponse,
    ROOT_FOLDER_ID,
} from "@/interface";
import { DataManager } from "./data-manager";
import { FileStructure } from "./file-structure";

export interface FolderUpdateArguments {
    id: number;
    name?: string | null;
    parentId?: number | null;
    oldParentId?: number | null;
}

export class FolderManager {
    _data: DataManager;
    _structure: FileStructure;

    constructor(data: DataManager, structure: FileStructure) {
        makeAutoObservable(this, { _data: false, _structure: false });
        this._data = data;
        this._structure = structure;
    }

    async create(name: string, parentId: number = ROOT_FOLDER_ID) {
        let response: FolderResponse | null;
        try {
            response = await createFolder(parentId, name);
        } catch (error) {
            console.error(error);
            return null;
        }

        if (response) this._structure.addFolder(response);

        return response;
    }

    validate(id: number | null, parentId: number, name: string) {
        const response: FolderValidateResponse = {
            id,
            parent_id: parentId,
            name,
        };
        const parentNode = this._structure.folders[parentId];
        for (const subFolderNode of Object.values(parentNode.subFolders)) {
            if (subFolderNode.id != id && subFolderNode.name == name) {
                response.nameCollision = {
                    collidingFolderId: subFolderNode.id,
                };
                break;
            }
        }
        return response;
    }

    async update({
        id,
        name = null,
        parentId = null,
        oldParentId = null,
    }: FolderUpdateArguments) {
        let folderNode = this._structure.folders[id];

        const nameChanged = name !== null;
        const parentChanged =
            parentId !== null &&
            oldParentId !== null &&
            parentId != oldParentId;

        let response: FolderResponse | null;
        try {
            response = await updateFolder({ id, parent_id: parentId, name });
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

    getInfo(id: number) {
        return this._structure.folders[id];
    }

    async getAll(): Promise<FolderResponse[] | null> {
        let response: FolderResponse[] | null;
        try {
            response = await getFolders();
        } catch (error) {
            console.error(error);
            console.error("Failed to fetch all folders from the backend.");
            return null;
        }

        this._structure.reset();
        for (const folder of response) this._structure.addFolder(folder);

        return response;
    }

    async delete(id: number) {
        const fileIds = this._structure.collectFileIds(id);
        const success = await this._data.delete(fileIds);
        if (!success) {
            console.error(`Failed to delete folder ${id} and its descendants.`);
            return null;
        }
        return fileIds;
    }
}

async function createFolder(
    parentId: number,
    name: string,
): Promise<FolderResponse> {
    return invoke<FolderResponse>("create_folder", {
        info: { parent_id: parentId, name },
    });
}

async function updateFolder(update: FolderUpdate): Promise<FolderResponse> {
    return invoke<FolderResponse>("update_folder", { folder: update });
}

async function getFolders() {
    return invoke<FolderResponse[]>("get_folders");
}
