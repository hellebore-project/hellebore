import { invoke } from "@tauri-apps/api/core";

import type { Id } from "@/interface";

import {
    CommandNames,
    ENTRY_TYPE_LABEL_MAPPING,
    EntryType,
    EntryTypeLabel,
    ROOT_FOLDER_ID,
} from "../constants";
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
    LanguageProperties,
    PersonProperties,
} from "../interface";

export class EntryManager {
    async create(
        projectId: Id,
        entityType: EntryType,
        title: string,
        folderId: Id = ROOT_FOLDER_ID,
    ): Promise<EntryInfoResponse | null> {
        let response: EntryInfoResponse | null;

        try {
            if (entityType === EntryType.Language)
                response = await this._createLanguage(
                    projectId,
                    title,
                    folderId,
                );
            else if (entityType === EntryType.Person)
                response = await this._createPerson(projectId, title, folderId);
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
        projectId,
        id,
        entryType,
        folderId = null,
        title = null,
        properties = null,
        text = null,
        words = null,
    }: EntryUpdate<E> & {
        projectId: Id;
    }): Promise<EntryUpdateResponse | null> {
        let response: DiagnosticResponse<EntryUpdateResponse>;

        try {
            response = await this._update({
                projectId,
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
        projectId: Id,
        entries: EntryUpdate<E>[],
    ): Promise<EntryUpdateResponse[] | null> {
        let responses: DiagnosticResponse<EntryUpdateResponse>[];

        try {
            responses = await this._bulkUpdate(projectId, entries);
        } catch (error) {
            console.error(error);
            return null;
        }

        return responses.map((r) => r.data);
    }

    async get(projectId: Id, id: Id): Promise<EntryInfoResponse | null> {
        try {
            return await this._getInfo(projectId, id);
        } catch (error) {
            console.error(error);
            console.error(`Failed to fetch entry ${id}.`);
            return null;
        }
    }

    async getProperties(
        projectId: Id,
        id: Id,
    ): Promise<EntryPropertyResponse | null> {
        let response: BackendEntryPropertyResponse | null;

        try {
            response = await this._getProperties(projectId, id);
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

    async getArticle(
        projectId: Id,
        id: Id,
    ): Promise<EntryArticleResponse | null> {
        let response: DiagnosticResponse<EntryArticleResponse> | null;

        try {
            response = await this._getArticle(projectId, id);
        } catch (error) {
            console.error(error);
            return null;
        }

        for (const error of response.errors) {
            console.error(error);
        }

        return response.data;
    }

    async getAll(projectId: Id): Promise<EntryInfoResponse[] | null> {
        let response: EntryInfoResponse[] | null;

        try {
            response = await this._getAll(projectId);
        } catch (error) {
            console.error(error);
            console.error("Failed to fetch all entries.");
            return null;
        }

        return response;
    }

    async search({
        projectId,
        keyword,
        before = null,
        after = null,
        limit = 5,
    }: EntrySearch & { projectId: Id }): Promise<EntryInfoResponse[] | null> {
        let response: EntryInfoResponse[];
        try {
            response = await this._search(projectId, {
                keyword,
                before,
                after,
                limit,
            });
        } catch (error) {
            console.error("Failed to search for entries.");
            console.error(error);
            return null;
        }

        return response.slice(0, limit);
    }

    async delete(projectId: Id, id: Id): Promise<boolean> {
        try {
            await this._delete(projectId, id);
        } catch (error) {
            console.error(error);
            console.error(`Failed to delete entry ${id}.`);
            return false;
        }

        return true;
    }

    async validateTitle(
        projectId: Id,
        id: Id | null,
        title: string,
    ): Promise<boolean | null> {
        try {
            const response = await invoke<DiagnosticResponse<boolean>>(
                CommandNames.Entry.ValidateTitle,
                { projectId, id, title },
            );
            return response.data;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    private async _createLanguage(
        projectId: Id,
        name: string,
        folderId: Id,
    ): Promise<EntryInfoResponse> {
        return this._create<LanguageProperties>({
            projectId,
            entryType: EntryType.Language,
            folderId,
            title: name,
            properties: {},
        });
    }

    private async _createPerson(
        projectId: Id,
        name: string,
        folderId: Id,
    ): Promise<EntryInfoResponse> {
        return this._create<PersonProperties>({
            projectId,
            entryType: EntryType.Person,
            folderId,
            title: name,
            properties: { name },
        });
    }

    private async _create<E extends BaseEntity>({
        projectId,
        entryType,
        folderId,
        title,
        properties,
    }: EntryCreate<E> & { projectId: Id }): Promise<EntryInfoResponse> {
        const entryTypeLabel = ENTRY_TYPE_LABEL_MAPPING[entryType];
        const mappedProperties = { [entryTypeLabel]: properties };

        const payload = {
            projectId,
            entry: {
                folderId,
                entityType: entryType,
                title,
                properties: mappedProperties,
            },
        };

        return invoke<EntryInfoResponse>(CommandNames.Entry.Create, payload);
    }

    private async _update<E extends BaseEntity>({
        projectId,
        ...entry
    }: EntryUpdate<E> & { projectId: Id }) {
        const entryPayload = this._createUpdateRequestPayload(entry);
        const payload = { projectId, entry: entryPayload };
        return invoke<DiagnosticResponse<EntryUpdateResponse>>(
            CommandNames.Entry.Update,
            payload,
        );
    }

    private async _bulkUpdate<E extends BaseEntity>(
        projectId: Id,
        entries: EntryUpdate<E>[],
    ) {
        const entryPayloads = entries.map((entry) =>
            this._createUpdateRequestPayload(entry),
        );
        const payload = { projectId, entries: entryPayloads };
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
            if (entryType === null || entryType === undefined)
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

    private async _getInfo(projectId: Id, id: Id): Promise<EntryInfoResponse> {
        return invoke<EntryInfoResponse>(CommandNames.Entry.GetInfo, {
            projectId,
            id,
        });
    }

    private async _getProperties(
        projectId: Id,
        id: Id,
    ): Promise<BackendEntryPropertyResponse> {
        return invoke<BackendEntryPropertyResponse>(
            CommandNames.Entry.GetProperties,
            { projectId, id },
        );
    }

    private async _getArticle(
        projectId: Id,
        id: Id,
    ): Promise<DiagnosticResponse<EntryArticleResponse>> {
        return invoke<DiagnosticResponse<EntryArticleResponse>>(
            CommandNames.Entry.GetArticle,
            {
                projectId,
                id,
            },
        );
    }

    private async _getAll(projectId: Id) {
        return invoke<EntryInfoResponse[]>(CommandNames.Entry.GetAll, {
            projectId,
        });
    }

    private async _search(projectId: Id, payload: EntrySearch) {
        return invoke<EntryInfoResponse[]>(CommandNames.Entry.Search, {
            projectId,
            query: payload,
        });
    }

    private async _delete(projectId: Id, id: Id): Promise<void> {
        return invoke(CommandNames.Entry.Delete, {
            projectId,
            id,
        });
    }
}
