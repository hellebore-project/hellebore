import { EntryType } from "@/api";

import type { Id } from "../../common";

export interface PropertyChangeEvent {
    property: string;
    value: unknown;
}

export interface CreateEntryEvent {
    entryType: EntryType;
    title: string;
    folderId: Id;
}

export interface EntryChangeEvent {
    id: Id;
    titleChanged?: boolean;
    folderIdChanged?: boolean;
    propertiesChanged?: boolean;
    textChanged?: boolean;
    lexiconChanged?: boolean;
    syncImmediately?: boolean;
}

export interface RenameEntryEvent {
    id: Id;
    title: string;
}

export interface DeleteEntryEvent {
    id: Id;
    title: string;
}
