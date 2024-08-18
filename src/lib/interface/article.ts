import { Entity, EntityType } from "./entities";

export interface ArticleUpdate<E extends Entity> {
    id: number;
    entity_type: EntityType;
    title: string | null;
    body: string | null;
    entity: E | null;
}

export interface ArticleInfoResponse {
    id: number;
    entity_type: EntityType;
    title: string;
}

export interface ArticleResponse<E extends Entity> extends ArticleInfoResponse {
    entity: E;
    body: string;
}
