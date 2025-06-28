import { IdentifiedObject } from "../common";
import { BaseEntity, EntityType } from "../entity";

export interface BaseEntityInfo extends IdentifiedObject {
    entity_type: EntityType;
}

export interface EntityCreate<E extends BaseEntity> {
    folder_id: number;
    title: string;
    data: E;
}

export interface EntityUpdate<E extends BaseEntity> extends IdentifiedObject {
    data: E;
}

export interface EntityInfoResponse extends BaseEntityInfo {
    folder_id: number;
    title: string;
}

export interface EntityResponse<E extends BaseEntity> extends EntityUpdate<E> {}
