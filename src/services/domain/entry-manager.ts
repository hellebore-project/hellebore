import { invoke } from "@tauri-apps/api/core";
import { makeAutoObservable } from "mobx";

import { ENTITY_TYPE_LABELS, EntityType, ROOT_FOLDER_ID } from "@/constants";
import {
    BaseEntity,
    Id,
    LanguageProperties,
    PersonProperties,
} from "@/interface";
import {
    ApiError,
    EntryInfoResponse,
    EntryCreate,
    EntryPropertyResponse,
    EntryPropertyUpdate,
    EntryArticleResponse,
} from "@/schema";
import { FileStructure } from "./file-structure";
import { is_field_unique, process_api_error } from "./error-handler";

type PrivateKeys = "_structure";

export enum EntryType {
    Language = "Language",
    Person = "Person",
}

export type EntryPropertyMapping = { [type in EntryType]: BaseEntity };

export interface RawEntryPropertyResponse {
    info: EntryInfoResponse;
    properties: EntryPropertyMapping;
}

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

    async updateProperties<E extends BaseEntity>(
        id: Id,
        entityType: EntityType,
        properties: E,
    ): Promise<EntryUpdateResponse> {
        // some entity types don't have properties, so skip updating them
        if (entityType === EntityType.LANGUAGE) return { updated: false };

        const payload = { id, properties };

        try {
            await this._updateProperties(entityType, payload);
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
            this._structure.getEntry(id).folder_id = folderId;
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
            this._structure.getEntry(id).title = title;

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

    async get(id: Id): Promise<EntryInfoResponse | null> {
        try {
            return await this._getInfo(id);
        } catch (error) {
            console.error(error);
            console.error(`Failed to fetch entry ${id}.`);
            return null;
        }
    }

    async getProperties(id: number): Promise<EntryPropertyResponse | null> {
        let response: RawEntryPropertyResponse | null;

        try {
            response = await this._getProperties(id);
        } catch (error) {
            console.error(error);
            return null;
        }

        if (response === null) {
            console.error(`Failed to fetch properties of entry ${id}.`);
            return null;
        }

        const keys = Object.keys(response.properties) as EntryType[];
        if (keys.length === 0) {
            console.error(`Entry property response is malformed.`);
            return null;
        }

        const key = keys[0];
        const properties = response.properties[key];

        return {
            info: response.info,
            properties,
        };
    }

    async getArticle(id: Id): Promise<EntryArticleResponse | null> {
        try {
            return await this._getArticle(id);
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
            console.error("Failed to fetch all entries.");
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
        // TODO: query the backend instead of checking the cache
        return Object.values(this._structure.files)
            .filter((info) => info.title.toLowerCase().startsWith(arg))
            .slice(0, maxResults);
    }

    async delete(id: number): Promise<boolean> {
        try {
            await this._delete(id);
        } catch (error) {
            console.error(error);
            console.error(`Failed to delete entry ${id}.`);
            return false;
        }

        this._structure.deleteFile(id);

        return true;
    }

    async _createLanguage(
        name: string,
        folder_id: number,
    ): Promise<EntryInfoResponse> {
        const entry: EntryCreate<LanguageProperties> = {
            folder_id,
            title: name,
            properties: {},
        };
        return invoke<EntryInfoResponse>("create_language", {
            entry,
        });
    }

    async _createPerson(
        name: string,
        folder_id: number,
    ): Promise<EntryInfoResponse> {
        const entry: EntryCreate<PersonProperties> = {
            folder_id,
            title: name,
            properties: { name },
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

    async _updateProperties<E extends BaseEntity>(
        entityType: EntityType,
        entry: EntryPropertyUpdate<E>,
    ): Promise<void> {
        const command = `update_${ENTITY_TYPE_LABELS[entityType].toLowerCase()}`;
        return invoke(command, { entry });
    }

    async _updateText(id: Id, text: string) {
        return invoke<void>("update_entry_text", { id, text });
    }

    async _getInfo(id: Id): Promise<EntryInfoResponse> {
        return invoke<EntryInfoResponse>("get_entry", { id });
    }

    async _getProperties(id: Id): Promise<RawEntryPropertyResponse> {
        return invoke<RawEntryPropertyResponse>("get_entry_properties", { id });
    }

    async _getArticle(id: Id): Promise<EntryArticleResponse> {
        return invoke<EntryArticleResponse>("get_entry_text", { id });
    }

    async _getAll() {
        return invoke<EntryInfoResponse[]>("get_entries");
    }

    async _delete(id: Id): Promise<void> {
        return invoke("delete_entry", { id });
    }
}
