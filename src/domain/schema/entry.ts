import { BaseEntity, EntityType } from "@/domain";
import { IdentifiedObject } from "@/interface";

export interface BaseEntryInfo extends IdentifiedObject {
    entityType: EntityType;
}

export interface EntryCreate<E extends BaseEntity> {
    folderId: number;
    title: string;
    properties: E;
}

export interface EntryPropertyUpdate<E extends BaseEntity>
    extends IdentifiedObject {
    properties: E;
}

export interface EntryInfoResponse extends BaseEntryInfo {
    folderId: number;
    title: string;
}

export interface EntryPropertyResponse {
    info: EntryInfoResponse;
    properties: BaseEntity;
}

export interface EntryArticleResponse {
    info: EntryInfoResponse;
    text: string;
}
