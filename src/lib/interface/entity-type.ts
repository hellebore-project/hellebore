import { pluralize } from "../utils/string";

/**
 * Mapping of all entity types to a unique numeric code.
 * Must match the mapping in the backend.
 */
export enum EntityType {
    NONE = 0,
    ARTICLE = 1,
    LANGUAGE = 2,
    WORD = 3,
    PERSON = 4,
}

export const ENTITY_TYPE_LABELS: { [entityType: number]: string } = {
    [EntityType.LANGUAGE]: "Language",
    [EntityType.PERSON]: "Person",
    [EntityType.WORD]: "Word",
};
export const ENTITY_TYPE_PLURAL_LABELS = Object.fromEntries(
    Object.entries(ENTITY_TYPE_LABELS).map(([entityType, label]) => [
        entityType,
        pluralize(label),
    ]),
);

export const ARTICLE_ENTITY_TYPES = [EntityType.PERSON, EntityType.LANGUAGE];
export const ALL_ENTITY_TYPES = [...ARTICLE_ENTITY_TYPES, EntityType.WORD];
