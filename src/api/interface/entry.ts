import type { JSONContent } from "@tiptap/core";

import type { Id, IdentifiedObject } from "@/interface";

import { EntryType, EntryTypeLabel } from "../constants";
import type { BaseEntity } from "./base-entity";
import type { WordUpsert, WordUpsertResponse } from "./word";

export type TaggedEntryProperties<E extends BaseEntity> = E & {
    type: EntryTypeLabel;
};

export interface BaseEntryInfo extends IdentifiedObject {
    entityType: EntryType;
}

export interface EntryCreate<E extends BaseEntity> {
    entryType: EntryType;
    folderId: Id;
    title: string;
    properties: E;
}

export interface BackendEntryCreate<E extends BaseEntity = BaseEntity> {
    projectId: Id;
    entry: {
        folderId: Id;
        entityType: EntryType;
        title: string;
        properties: TaggedEntryProperties<E>;
    };
}

export interface EntryUpdate<E extends BaseEntity> extends IdentifiedObject {
    entryType?: EntryType | null;
    folderId?: Id | null;
    title?: string | null;
    properties?: E | null;
    text?: string | null;
    words?: WordUpsert[] | null;
}

export interface BackendEntryUpdate<
    E extends BaseEntity = BaseEntity,
> extends IdentifiedObject {
    folderId: Id | null;
    title: string | null;
    properties: TaggedEntryProperties<E> | null;
    text: string | null;
    words: WordUpsert[] | null;
}

export interface EntryUpdateResponse extends IdentifiedObject {
    folderId: {
        updated: boolean;
    };
    title: {
        updated: boolean;
        isUnique: boolean;
    };
    properties: {
        updated: boolean;
    };
    text: {
        updated: boolean;
    };
    words: WordUpsertResponse[];
}

export interface EntryInfoResponse extends BaseEntryInfo {
    folderId: Id;
    title: string;
}

export interface EntryPropertyResponse {
    info: EntryInfoResponse;
    properties: BaseEntity;
}

export interface BackendEntryPropertyResponse<
    E extends BaseEntity = BaseEntity,
> {
    info: EntryInfoResponse;
    properties: TaggedEntryProperties<E>;
}

export interface EntryArticleResponse {
    info: EntryInfoResponse;
    text: JSONContent;
}

export type EntryQueryOptions = object;
