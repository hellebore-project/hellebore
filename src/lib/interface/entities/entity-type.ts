export enum EntityType {
    LANGUAGE = 2,
    WORD = 3,
}

export const ENTITY_TYPE_LABELS = {
    [EntityType.LANGUAGE]: "Language",
    [EntityType.WORD]: "Word",
};

export const ARTICLE_ENTITY_TYPES = [EntityType.LANGUAGE];
export const ALL_ENTITY_TYPES = [...ARTICLE_ENTITY_TYPES, EntityType.WORD];
