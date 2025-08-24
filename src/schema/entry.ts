import { EntityType } from "@/constants";
import { BaseEntity, IdentifiedObject } from "@/interface";

export interface BaseEntryInfo extends IdentifiedObject {
    entity_type: EntityType;
}

export interface EntryCreate<E extends BaseEntity> {
    folder_id: number;
    title: string;
    properties: E;
}

export interface EntryPropertyUpdate<E extends BaseEntity>
    extends IdentifiedObject {
    properties: E;
}

export interface EntryInfoResponse extends BaseEntryInfo {
    folder_id: number;
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
