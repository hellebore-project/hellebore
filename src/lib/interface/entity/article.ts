import { BaseEntity } from "./base";
import { IdentifiedObject } from "../common";
import { EntityType } from "./entity-type";

export interface BaseArticleInfo extends IdentifiedObject {
    entity_type: EntityType;
}

// Interfaces for creating articles

export interface ArticleCreate<E extends BaseEntity> {
    folder_id: number;
    title: string;
    data: E;
}

// Interfaces for updating articles

export interface ArticleInfoUpdate extends BaseArticleInfo {
    folder_id: number | null;
    title: string | null;
}

export interface ArticleUpdate<E extends BaseEntity> extends ArticleInfoUpdate {
    body: string | null;
    entity: E | null;
}

export interface ArticleUpdateResponse extends ArticleInfoUpdate {
    folderChanged: boolean;
    isTitleUnique?: boolean;
    titleChanged: boolean;
    propertiesChanged: boolean;
    textChanged: boolean;
}

// Interfaces for creating and fetching articles

export interface ArticleInfoResponse extends BaseArticleInfo {
    folder_id: number;
    title: string;
}

export interface ArticleResponse<E extends BaseEntity>
    extends ArticleInfoResponse {
    entity: E;
    body: string;
}

export type ArticleNode = ArticleInfoResponse;
