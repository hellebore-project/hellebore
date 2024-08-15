export enum EntityType {
    LANGUAGE = "LANGUAGE",
    WORD = "WORD",
}

export const ENTITY_TYPE_LABELS = {
    [EntityType.LANGUAGE]: "Language",
    [EntityType.WORD]: "Word",
};

export const ARTICLE_ENTITY_TYPES = [EntityType.LANGUAGE];
