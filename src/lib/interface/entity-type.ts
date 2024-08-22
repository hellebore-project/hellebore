export enum EntityType {
    NONE = 0,
    ARTICLE = 1,
    LANGUAGE = 2,
    WORD = 3,
}

export const ENTITY_TYPE_LABELS: { [entityType: number]: string } = {
    [EntityType.LANGUAGE]: "Language",
    [EntityType.WORD]: "Word",
};

export const ARTICLE_ENTITY_TYPES = [EntityType.LANGUAGE];
export const ALL_ENTITY_TYPES = [...ARTICLE_ENTITY_TYPES, EntityType.WORD];
