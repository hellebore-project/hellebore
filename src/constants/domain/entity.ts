import { pluralize } from "@/utils/string";

/**
 * Mapping of all entity types to a unique numeric code.
 * Must match the mapping in the backend.
 */
export enum EntityType {
    NONE = 0,

    // Core
    SESSION = 1,
    PROJECT = 2,
    FOLDER = 3,
    ENTRY = 4,

    // Dictionary
    LANGUAGE = 10,
    WORD = 11,

    // Calendar
    // TODO

    // Encyclopedia
    PERSON = 30,
}

export const ENTITY_TYPE_LABELS: Record<number, string> = {
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

export const FILE_ENTITY_TYPES = [EntityType.PERSON, EntityType.LANGUAGE];
export const ALL_ENTITY_TYPES = [...FILE_ENTITY_TYPES, EntityType.WORD];
