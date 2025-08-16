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
            await this._delete(data);
        } catch (error) {
            console.error(error);
            return false;
        }

        for (const folderId of data.folders)
            this._structure.deleteFolder(folderId);
        for (const entryId of data.entries) this._structure.deleteFile(entryId);

        return true;
    }

    async _delete(data: BulkData): Promise<void> {
        const command = "delete_bulk_data";
        return invoke<void>(command, { data });
    }
}
