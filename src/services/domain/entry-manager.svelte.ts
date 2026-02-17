// eslint-disable-next-line
import { invoke } from "@tauri-apps/api/core";

import {
    CommandNames,
    ENTRY_TYPE_LABEL_MAPPING,
    EntryType,
    EntryTypeLabel,
    ROOT_FOLDER_ID,
} from "@/constants";
import type {
    BackendEntryPropertyResponse,
    BackendEntryUpdate,
    BaseEntity,
    EntryArticleResponse,
    EntryCreate,
    EntryInfoResponse,
    EntryPropertyResponse,
    EntrySearch,
    EntryUpdate,
    EntryUpdateResponse,
    DiagnosticResponse,
    Id,
    LanguageProperties,
    PersonProperties,
} from "@/interface";

export class EntryManager {
    async create(
        entityType: EntryType,
        title: string,
        folderId: number = ROOT_FOLDER_ID,
    ): Promise<EntryInfoResponse | null> {
        let response: EntryInfoResponse | null;

        try {
            if (entityType === EntryType.Language)
                response = await this._createLanguage(title, folderId);
            else if (entityType === EntryType.Person)
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

    async update<E extends BaseEntity>({
        id,
        entryType,
        folderId = null,
        title = null,
        properties = null,
        text = null,
        words = null,
    }: EntryUpdate<E>): Promise<EntryUpdateResponse | null> {
        let response: DiagnosticResponse<EntryUpdateResponse>;

        try {
            response = await this._update({
                id,
                entryType,
                folderId,
                title,
                properties,
                text,
                words,
            });
        } catch (error) {
            console.error(error);
            return null;
        }

        return response.data;
    }

    async bulkUpdate<E extends BaseEntity>(
        entries: EntryUpdate<E>[],
    ): Promise<EntryUpdateResponse[] | null> {
        let responses: DiagnosticResponse<EntryUpdateResponse>[];

        try {
            responses = await this._bulkUpdate(entries);
        } catch (error) {
            console.error(error);
            return null;
        }

        return responses.map((r) => r.data);
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
        let response: BackendEntryPropertyResponse | null;

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

        const keys = Object.keys(response.properties) as EntryTypeLabel[];
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
        let response: DiagnosticResponse<EntryArticleResponse> | null;

        try {
            response = await this._getArticle(id);
        } catch (error) {
            console.error(error);
            return null;
        }

        for (const error of response.errors) {
            console.error(error);
        }

        return response.data;
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

    async search({
        keyword,
        before = null,
        after = null,
        limit = 5,
    }: EntrySearch): Promise<EntryInfoResponse[] | null> {
        let response: EntryInfoResponse[];
        try {
            response = await this._search({ keyword, before, after, limit });
        } catch (error) {
            console.error("Failed to search for entries.");
            console.error(error);
            return null;
        }

        return response.slice(0, limit);
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

    private async _createLanguage(
        name: string,
        folderId: number,
    ): Promise<EntryInfoResponse> {
        return this._create<LanguageProperties>({
            entryType: EntryType.Language,
            folderId,
            title: name,
            properties: {},
        });
    }

    private async _createPerson(
        name: string,
        folderId: number,
    ): Promise<EntryInfoResponse> {
        return this._create<PersonProperties>({
            entryType: EntryType.Person,
            folderId,
            title: name,
            properties: { name },
        });
    }

    private async _create<E extends BaseEntity>({
        entryType,
        folderId,
        title,
        properties,
    }: EntryCreate<E>): Promise<EntryInfoResponse> {
        const entryTypeLabel = ENTRY_TYPE_LABEL_MAPPING[entryType];
        const mappedProperties = { [entryTypeLabel]: properties };

        const payload = {
            entry: {
                folderId,
                entityType: entryType,
                title,
                properties: mappedProperties,
            },
        };

        return invoke<EntryInfoResponse>(CommandNames.Entry.Create, payload);
    }

    private async _update<E extends BaseEntity>(entry: EntryUpdate<E>) {
        const entryPayload = this._createUpdateRequestPayload(entry);
        const payload = { entry: entryPayload };
        return invoke<DiagnosticResponse<EntryUpdateResponse>>(
            CommandNames.Entry.Update,
            payload,
        );
    }

    private async _bulkUpdate<E extends BaseEntity>(entries: EntryUpdate<E>[]) {
        const entryPayloads = entries.map((entry) =>
            this._createUpdateRequestPayload(entry),
        );
        const payload = { entries: entryPayloads };
        return invoke<DiagnosticResponse<EntryUpdateResponse>[]>(
            CommandNames.Entry.BulkUpdate,
            payload,
        );
    }

    private _createUpdateRequestPayload<E extends BaseEntity>({
        id,
        entryType = null,
        folderId = null,
        title = null,
        properties = null,
        text = null,
        words = null,
    }: EntryUpdate<E>): BackendEntryUpdate {
        let mappedProperties: Partial<Record<EntryTypeLabel, E>> | null = null;
        if (properties) {
            if (entryType === null)
                throw (
                    `Failed to update entry ${id}; a non-null entry type must be specified ` +
                    "in order to update the entry properties."
                );

            const entryTypeLabel = ENTRY_TYPE_LABEL_MAPPING[entryType];
            mappedProperties = { [entryTypeLabel]: properties };
        }

        return {
            id,
            folderId,
            title,
            properties: mappedProperties,
            text,
            words,
        };
    }

    private async _getInfo(id: Id): Promise<EntryInfoResponse> {
        return invoke<EntryInfoResponse>(CommandNames.Entry.GetInfo, { id });
    }

    private async _getProperties(
        id: Id,
    ): Promise<BackendEntryPropertyResponse> {
        return invoke<BackendEntryPropertyResponse>(
            CommandNames.Entry.GetProperties,
            { id },
        );
    }

    private async _getArticle(
        id: Id,
    ): Promise<DiagnosticResponse<EntryArticleResponse>> {
        return invoke<DiagnosticResponse<EntryArticleResponse>>(
            CommandNames.Entry.GetArticle,
            {
                id,
            },
        );
    }

    private async _getAll() {
        return invoke<EntryInfoResponse[]>(CommandNames.Entry.GetAll);
    }

    private async _search(payload: EntrySearch) {
        return invoke<EntryInfoResponse[]>(CommandNames.Entry.Search, {
            query: payload,
        });
    }

    private async _delete(id: Id): Promise<void> {
        return invoke(CommandNames.Entry.Delete, { id });
    }
}
