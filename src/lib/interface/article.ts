import { ArticleData } from "./article-data";
import { EntityType } from "./entity-type";

export interface ArticleUpdate<E extends ArticleData> {
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

export interface ArticleResponse<E extends ArticleData>
    extends ArticleInfoResponse {
    entity: E;
    body: string;
}
