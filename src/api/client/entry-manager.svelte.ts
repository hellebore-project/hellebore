import { invoke, type InvokeArgs } from "@tauri-apps/api/core";

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
    BackendEntryCreate,
} from "../interface";

export class EntryManager {
    async create(
        projectId: Id,
        entryType: EntryType,
        title: string,
        folderId: Id = ROOT_FOLDER_ID,
    ): Promise<EntryInfoResponse | null> {
        let response: EntryInfoResponse | null;

        try {
            if (entryType === EntryType.Language)
                response = await this._createLanguage(
                    projectId,
                    title,
                    folderId,
                );
            else if (entryType === EntryType.Person)
                response = await this._createPerson(projectId, title, folderId);
            else {
                console.error(
                    `Unable to create new entry of type ${entryType}.`,
                );
                return null;
            }
        } catch (error) {
            console.error(error);
            return null;
        }

        return response;
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

        const payload: BackendEntryCreate = {
            projectId,
            entry: {
                folderId,
                entityType: entryType,
                title,
                properties: mappedProperties,
            },
        };

        return invoke<EntryInfoResponse>(
            CommandNames.Entry.Create,
            payload as unknown as InvokeArgs,
        );
    }

    async bulkUpdate<E extends BaseEntity>(
        projectId: Id,
        entries: EntryUpdate<E>[],
    ): Promise<EntryUpdateResponse[] | null> {
        const entryPayloads = entries.map((entry) =>
            this._createUpdateRequestPayload(entry),
        );
        const payload = { projectId, entries: entryPayloads };

        let responses: DiagnosticResponse<EntryUpdateResponse>[];
        try {
            responses = await invoke<DiagnosticResponse<EntryUpdateResponse>[]>(
                CommandNames.Entry.BulkUpdate,
                payload,
            );
        } catch (error) {
            console.error(error);
            return null;
        }

        return responses.map((r) => r.data);
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
                    `Failed to update entry '${id}'; a non-null entry type must be specified ` +
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

    async get(projectId: Id, id: Id): Promise<EntryInfoResponse | null> {
        try {
            return await invoke<EntryInfoResponse>(CommandNames.Entry.GetInfo, {
                projectId,
                id,
            });
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
            response = await invoke<BackendEntryPropertyResponse>(
                CommandNames.Entry.GetProperties,
                { projectId, id },
            );
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
            response = await invoke<DiagnosticResponse<EntryArticleResponse>>(
                CommandNames.Entry.GetArticle,
                {
                    projectId,
                    id,
                },
            );
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
            response = await invoke<EntryInfoResponse[]>(
                CommandNames.Entry.GetAll,
                {
                    projectId,
                },
            );
        } catch (error) {
            console.error(error);
            console.error("Failed to fetch all entries.");
            return null;
        }

        return response;
    }

    async search(
        projectId: Id,
        query: EntrySearch,
    ): Promise<EntryInfoResponse[] | null> {
        let response: EntryInfoResponse[];
        try {
            response = await invoke<EntryInfoResponse[]>(
                CommandNames.Entry.Search,
                {
                    projectId,
                    query,
                },
            );
        } catch (error) {
            console.error("Failed to search for entries.");
            console.error(error);
            return null;
        }

        return response;
    }

    async delete(projectId: Id, id: Id): Promise<boolean> {
        try {
            await invoke(CommandNames.Entry.Delete, {
                projectId,
                id,
            });
        } catch (error) {
            console.error(error);
            console.error(`Failed to delete entry ${id}.`);
            return false;
        }

        return true;
    }
}
