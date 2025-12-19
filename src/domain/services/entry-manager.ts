import { invoke } from "@tauri-apps/api/core";

import {
    ApiError,
    BaseEntity,
    EntryInfoResponse,
    EntryCreate,
    EntryPropertyResponse,
    EntryPropertyUpdate,
    EntryArticleResponse,
    CommandNames,
    EntityType,
    ROOT_FOLDER_ID,
    LanguageProperties,
    PersonProperties,
} from "@/domain";
import { Id } from "@/interface";

import { is_field_unique, process_api_error } from "./error-handler";

export enum EntryType {
    Language = "Language",
    Person = "Person",
}

export type EntryPropertyMapping = Partial<Record<EntryType, BaseEntity>>;

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
    async create(
        entityType: EntityType,
        title: string,
        folderId: number = ROOT_FOLDER_ID,
    ): Promise<EntryInfoResponse | null> {
        let response: EntryInfoResponse | null;

        try {
            if (entityType === EntityType.LANGUAGE)
                response = await this._createLanguage(title, folderId);
            else if (entityType === EntityType.PERSON)
                response = await this._createPerson(title, folderId);
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

    async updateFolder(id: Id, folderId: Id): Promise<boolean> {
        let updated = true;

        try {
            await this._updateFolder(id, folderId);
        } catch (error) {
            updated = false;
            console.error(error);
        }

        return updated;
    }

    async updateTitle(
        id: Id,
        title: string,
    ): Promise<EntryTitleUpdateResponse> {
        const response: EntryTitleUpdateResponse = {
            updated: true,
            isUnique: true,
        };

        try {
            await this._updateTitle(id, title);
        } catch (error) {
            response.updated = false;
            console.error(error);

            const _error = process_api_error(error as ApiError);
            if (!is_field_unique(_error, EntityType.ENTRY, "title"))
                response.isUnique = false;
        }

        return response;
    }

    async updateText(id: Id, text: string): Promise<EntryTextUpdateResponse> {
        let updated = true;
        try {
            await this._updateArticle(id, text);
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
        if (properties === undefined) {
            console.error(`Entry properties not returned in the response.`);
            return null;
        }

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

        return response;
    }

    async search(
        titleFragment: string,
        maxResults = 5,
    ): Promise<EntryInfoResponse[] | null> {
        let response: EntryInfoResponse[];
        try {
            response = await this._search(titleFragment);
        } catch (error) {
            console.error("Failed to search for entries.");
            console.error(error);
            return null;
        }

        return response.slice(0, maxResults);
    }

    async delete(id: number): Promise<boolean> {
        try {
            await this._delete(id);
        } catch (error) {
            console.error(error);
            console.error(`Failed to delete entry ${id}.`);
            return false;
        }

        return true;
    }

    async _createLanguage(
        name: string,
        folderId: number,
    ): Promise<EntryInfoResponse> {
        const entry: EntryCreate<LanguageProperties> = {
            folderId,
            title: name,
            properties: {},
        };
        return this._create<LanguageProperties>(EntityType.LANGUAGE, entry);
    }

    async _createPerson(
        name: string,
        folderId: number,
    ): Promise<EntryInfoResponse> {
        const entry: EntryCreate<PersonProperties> = {
            folderId: folderId,
            title: name,
            properties: { name },
        };
        return this._create<PersonProperties>(EntityType.PERSON, entry);
    }

    async _create<E extends BaseEntity>(
        entityType: EntityType,
        entry: EntryCreate<E>,
    ): Promise<EntryInfoResponse> {
        return invoke<EntryInfoResponse>(
            CommandNames.Entry.Create(entityType),
            { entry },
        );
    }

    async _updateFolder(id: Id, folderId: Id) {
        return invoke<void>(CommandNames.Entry.UpdateFolder, { id, folderId });
    }

    async _updateTitle(id: Id, title: string) {
        return invoke<void>(CommandNames.Entry.UpdateTitle, { id, title });
    }

    async _updateProperties<E extends BaseEntity>(
        entityType: EntityType,
        entry: EntryPropertyUpdate<E>,
    ): Promise<void> {
        return invoke(CommandNames.Entry.UpdateProperties(entityType), {
            entry,
        });
    }

    async _updateArticle(id: Id, text: string) {
        return invoke<void>(CommandNames.Entry.UpdateArticle, { id, text });
    }

    async _getInfo(id: Id): Promise<EntryInfoResponse> {
        return invoke<EntryInfoResponse>(CommandNames.Entry.GetInfo, { id });
    }

    async _getProperties(id: Id): Promise<RawEntryPropertyResponse> {
        return invoke<RawEntryPropertyResponse>(
            CommandNames.Entry.GetProperties,
            { id },
        );
    }

    async _getArticle(id: Id): Promise<EntryArticleResponse> {
        return invoke<EntryArticleResponse>(CommandNames.Entry.GetArticle, {
            id,
        });
    }

    async _getAll() {
        return invoke<EntryInfoResponse[]>(CommandNames.Entry.GetAll);
    }

    async _search(keyword: string) {
        return invoke<EntryInfoResponse[]>(CommandNames.Entry.Search, {
            keyword,
        });
    }

    async _delete(id: Id): Promise<void> {
        return invoke(CommandNames.Entry.Delete, { id });
    }
}
