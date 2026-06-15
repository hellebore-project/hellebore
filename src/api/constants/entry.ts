import { NIL as NIL_UUID } from "uuid";

import { EntityType } from "./entity";

export const ENTRY_ID_SENTINEL = NIL_UUID;

export enum EntryType {
    Language = EntityType.LANGUAGE,
    Person = EntityType.PERSON,
}

export enum EntryTypeLabel {
    Language = "Language",
    Person = "Person",
}

export const ENTRY_TYPE_LABEL_MAPPING = {
    [EntryType.Language]: EntryTypeLabel.Language,
    [EntryType.Person]: EntryTypeLabel.Person,
};
