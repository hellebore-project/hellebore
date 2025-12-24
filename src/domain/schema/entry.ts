import { BaseEntity, EntryType, EntryTypeLabel } from "@/domain";
import { Id, IdentifiedObject } from "@/interface";

export type EntryPropertyMapping = Partial<Record<EntryTypeLabel, BaseEntity>>;

export interface BaseEntryInfo extends IdentifiedObject {
    entityType: EntryType;
}

export interface EntryCreate<E extends BaseEntity> {
    entryType: EntryType;
    folderId: Id;
    title: string;
    properties: E;
}

export interface BackendEntryCreate {
    folderId: Id;
    entityType: EntryType;
    title: string;
    properties: EntryPropertyMapping;
}

export interface EntryUpdate<E extends BaseEntity> extends IdentifiedObject {
    entryType?: EntryType | null;
    folderId?: Id | null;
    title?: string | null;
    properties?: E | null;
    text?: string | null;
}

export interface BackendEntryUpdate extends IdentifiedObject {
    folderId: Id | null;
    title: string | null;
    properties: EntryPropertyMapping | null;
    text: string | null;
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
}

export interface EntryInfoResponse extends BaseEntryInfo {
    folderId: number;
    title: string;
}

export interface EntryPropertyResponse {
    info: EntryInfoResponse;
    properties: BaseEntity;
}

export interface BackendEntryPropertyResponse {
    info: EntryInfoResponse;
    properties: EntryPropertyMapping;
}

export interface EntryArticleResponse {
    info: EntryInfoResponse;
    text: string;
}
