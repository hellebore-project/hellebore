import { invoke } from "@tauri-apps/api/core";
import { makeAutoObservable } from "mobx";

import { FolderResponse, RichResponse, ROOT_FOLDER_ID } from "@/interface";

export class FolderService {
    constructor() {
        makeAutoObservable(this);
    }

    async create(name: string, parentId: number = ROOT_FOLDER_ID) {
        let response: FolderResponse | null;
        try {
            response = await createFolder(parentId, name);
        } catch (error) {
            console.error(error);
            return null;
        }
        return response;
    }

    async validate_name(
        name: string,
        parentId: number = ROOT_FOLDER_ID,
        id: number | null = null,
    ) {
        try {
            const response = await validateFolderName(name, parentId, id);
            return response.data;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    async update(id: number, name: string, parentId: number = ROOT_FOLDER_ID) {
        let response: FolderResponse | null;
        try {
            response = await updateFolder(id, parentId, name);
        } catch (error) {
            console.error(error);
            return null;
        }
        return response;
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
        return response;
    }
}

async function createFolder(
    parentId: number,
    name: string,
): Promise<FolderResponse> {
    console.log({ info: { parent_id: parentId, name } });
    return invoke<FolderResponse>("create_folder", {
        info: { parent_id: parentId, name },
    });
}

async function updateFolder(
    id: number,
    parentId: number,
    name: string,
): Promise<FolderResponse> {
    return invoke<FolderResponse>("update_folder", {
        folder: { id, info: { parent_id: parentId, name } },
    });
}

async function validateFolderName(
    name: string,
    parentId: number = ROOT_FOLDER_ID,
    id: number | null = null,
): Promise<RichResponse<boolean>> {
    return invoke<RichResponse<boolean>>("validate_folder_name", {
        id,
        parent_id: parentId,
        name,
    });
}

async function getFolders() {
    return invoke<FolderResponse[]>("get_folders");
}
