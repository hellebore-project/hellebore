import { invoke } from "@tauri-apps/api/core";
import { makeAutoObservable } from "mobx";

import {
    ApiError,
    EntryInfoResponse,
    ENTITY_TYPE_LABELS,
    EntityType,
    LanguageData,
    EntryCreate,
    ROOT_FOLDER_ID,
    Id,
    BaseEntity,
    EntryResponse,
    EntryUpdate,
} from "@/interface";
import { FileStructure } from "./file-structure";
import { is_field_unique, process_api_error } from "./utils";

type PrivateKeys = "_structure";

export interface EntryTitleUpdateResponse {
    updated: boolean;
    isUnique: boolean;
}

export interface EntryUpdateResponse {
    updated: boolean;
}

export interface EntryTextUpdateResponse {
    updated: boolean;
}

export class EntryManager {
    private _structure: FileStructure;

    constructor(structure: FileStructure) {
        makeAutoObservable<EntryManager, PrivateKeys>(this, {
            _structure: false,
        });
        this._structure = structure;
    }

    async create(
        entityType: EntityType,
        title: string,
        folder_id: number = ROOT_FOLDER_ID,
    ): Promise<EntryInfoResponse | null> {
        let response: EntryInfoResponse | null;

        try {
            if (entityType === EntityType.LANGUAGE)
                response = await this._createLanguage(title, folder_id);
            else if (entityType === EntityType.PERSON)
                response = await this._createPerson(title, folder_id);
            else {
                console.error(
                    `Unable to create new entry of type ${entityType}.`,
                );
                return null;
            }
        } catch (error) {
            console.error(error);
            return null;
        }

        this._structure.addFile(response);

        return response;
    }

    async update<E extends BaseEntity>(
        id: Id,
        data: E,
        entityType?: EntityType,
    ): Promise<EntryUpdateResponse> {
        entityType = entityType ?? this._structure.getInfo(id).entity_type;

        // some entity types don't have properties, so skip updating them
        if (entityType === EntityType.LANGUAGE) return { updated: false };

        const payload = { id, data };

        try {
            await this._updateData(entityType, payload);
        } catch (error) {
            console.error(error);
            return { updated: false };
        }

        return { updated: true };
    }

    async updateFolder(
        id: Id,
        folderId: Id,
        oldFolderId: Id,
    ): Promise<boolean> {
        let updated = true;

        try {
            await this._updateFolder(id, folderId);
        } catch (error) {
            updated = false;
            console.error(error);
        }

        if (updated) {
            this._structure.getInfo(id).folder_id = folderId;
            this._structure.moveFile(id, oldFolderId, folderId);
        }

        return updated;
    }

    async updateTitle(
        id: Id,
        title: string,
    ): Promise<EntryTitleUpdateResponse> {
        let response: EntryTitleUpdateResponse = {
            updated: true,
            isUnique: true,
        };

        try {
            await this._updateTitle(id, title);
        } catch (error) {
            response.updated = false;
            console.error(error);

            let _error = process_api_error(error as ApiError);
            if (!is_field_unique(_error, EntityType.ENTRY, "title"))
                response.isUnique = false;
        }

        if (title && response.updated)
            this._structure.getInfo(id).title = title;

        return response;
    }

    async updateText(id: Id, text: string): Promise<EntryTextUpdateResponse> {
        let updated = true;
        try {
            await this._updateText(id, text);
        } catch (error) {
            console.error(error);
            updated = false;
        }
        return { updated };
    }

    async get<E extends BaseEntity>(
        id: number,
        entityType?: EntityType,
    ): Promise<E | null> {
        if (entityType === EntityType.LANGUAGE) return {} as E;

        if (!entityType) entityType = this._structure.getInfo(id).entity_type;

        try {
            const response = await this._getData<E>(id, entityType);
            return response.data;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async getText(id: Id): Promise<string | null> {
        try {
            return await invoke<string>("get_entry_text", {
                id,
            });
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async getAll(): Promise<EntryInfoResponse[] | null> {
        let response: EntryInfoResponse[] | null;
        try {
            response = await this._getAll();
        } catch (error) {
            console.error(error);
            console.error("Failed to fetch all entries from the backend.");
            return null;
        }

        for (const info of response) {
            this._structure.addFile(info);
        }

        return response;
    }

    queryByTitle(
        titleFragment: string,
        maxResults: number = 5,
    ): EntryInfoResponse[] {
        const arg = titleFragment.toLowerCase();
        return Object.values(this._structure.files)
            .filter((info) => info.title.toLowerCase().startsWith(arg))
            .slice(0, maxResults);
    }

    async delete(id: number, entityType?: EntityType): Promise<boolean> {
        entityType = entityType ?? this._structure.getInfo(id).entity_type;

        try {
            await this._deleteEntity(id, entityType);
        } catch (error) {
            console.error(error);
            console.error(
                `Unable to delete entry ${id} of type ${entityType}.`,
            );
            return false;
        }

        this._structure.deleteFile(id);

        return true;
    }

    async _createLanguage(
        name: string,
        folder_id: number,
    ): Promise<EntryInfoResponse> {
        const entry: EntryCreate<LanguageData> = {
            folder_id,
            title: name,
            data: { name },
        };
        return invoke<EntryInfoResponse>("create_language", {
            entry,
        });
    }

    async _createPerson(
        name: string,
        folder_id: number,
    ): Promise<EntryInfoResponse> {
        const entry: EntryCreate<LanguageData> = {
            folder_id,
            title: name,
            data: { name },
        };
        return invoke<EntryInfoResponse>("create_person", { entry });
    }

    async _updateFolder(id: Id, folderId: Id) {
        return invoke<void>("update_entry_folder", {
            id,
            folderId,
        });
    }

    async _updateTitle(id: Id, title: string) {
        return invoke<void>("update_entry_title", { id, title });
    }

    async _updateData<E extends BaseEntity>(
        entityType: EntityType,
        entry: EntryUpdate<E>,
    ): Promise<void> {
        const command = `update_${ENTITY_TYPE_LABELS[entityType].toLowerCase()}`;
        return invoke(command, { entry });
    }

    async _updateText(id: Id, text: string) {
        return invoke<void>("update_entry_text", { id, text });
    }

    async _getData<E extends BaseEntity>(
        id: Id,
        entityType: EntityType,
    ): Promise<EntryResponse<E>> {
        const command = `get_${ENTITY_TYPE_LABELS[entityType].toLowerCase()}`;
        return invoke<EntryResponse<E>>(command, { id });
    }

    async _getAll() {
        return invoke<EntryInfoResponse[]>("get_entries");
    }

    async _deleteEntity(id: Id, entityType: EntityType): Promise<void> {
        const command = `delete_${ENTITY_TYPE_LABELS[entityType].toLowerCase()}`;
        return invoke(command, { id });
    }
}
