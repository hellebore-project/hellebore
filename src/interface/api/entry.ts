import { IdentifiedObject } from "../common";
import { BaseEntity, EntityType } from "../entity";

export interface BaseEntryInfo extends IdentifiedObject {
    entity_type: EntityType;
}

export interface EntryCreate<E extends BaseEntity> {
    folder_id: number;
    title: string;
    data: E;
}

export interface EntryUpdate<E extends BaseEntity> extends IdentifiedObject {
    data: E;
}

export interface EntryInfoResponse extends BaseEntryInfo {
    folder_id: number;
    title: string;
}

export interface EntryResponse<E extends BaseEntity> extends EntryUpdate<E> {}
