import { IdentifiedEntity, EntityType } from "./entities";

export interface ArticleItem {
    id: number;
    title: string;
    entity_type: EntityType;
}

export interface Article<E extends IdentifiedEntity> extends ArticleItem {
    content: string | null;
    entity: E | null;
}
