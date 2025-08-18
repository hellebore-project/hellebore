import { invoke } from "@tauri-apps/api/core";
import { makeAutoObservable } from "mobx";

import {
    FolderResponse,
    FolderUpdate,
    FolderValidateResponse,
    Id,
    ROOT_FOLDER_ID,
} from "@/interface";
import { FileStructure } from "./file-structure";

export interface FolderUpdateArguments {
    id: number;
    name?: string | null;
    parentId?: number | null;
    oldParentId?: number | null;
}

export class FolderManager {
    _structure: FileStructure;

    constructor(structure: FileStructure) {
        makeAutoObservable(this, { _structure: false });
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
            response = await this._update({ id, parent_id: parentId, name });
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

    async delete(id: Id) {
        try {
            await this._delete(id);
        } catch (error) {
            console.error(error);
            console.error(`Failed to delete folder ${id} and/or its contents.`);
        }

        const subtree = this._structure.subtree(id);
        this._structure.bulkDelete(subtree);

        return subtree;
    }

    async _create(parentId: Id, name: string): Promise<FolderResponse> {
        return invoke<FolderResponse>("create_folder", {
            info: { parent_id: parentId, name },
        });
    }

    async _update(update: FolderUpdate): Promise<FolderResponse> {
        return invoke<FolderResponse>("update_folder", { folder: update });
    }

    async _getAll() {
        return invoke<FolderResponse[]>("get_folders");
    }

    async _delete(id: Id): Promise<FolderResponse> {
        return invoke<FolderResponse>("delete_folder", { id });
    }
}
