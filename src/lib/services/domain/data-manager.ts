import { invoke } from "@tauri-apps/api/core";

import { BulkData } from "@/interface/api/data";
import { FileStructure } from "./file-structure";

export class DataManager {
    _structure: FileStructure;

    constructor(structure: FileStructure) {
        this._structure = structure;
    }

    async delete(data: BulkData): Promise<boolean> {
        try {
            await deleteBulkData(data);
        } catch (error) {
            console.error(error);
            return false;
        }

        for (const folderId of data.folders)
            this._structure.deleteFolder(folderId);
        for (const articleId of data.articles)
            this._structure.deleteArticle(articleId);

        return true;
    }
}

async function deleteBulkData(data: BulkData): Promise<void> {
    const command = "delete_bulk_data";
    return invoke<void>(command, { data });
}
