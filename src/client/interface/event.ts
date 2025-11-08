import {
    BaseEntity,
    EntityType,
    EntryTextUpdateResponse,
    EntryTitleUpdateResponse,
    EntryUpdateResponse,
    WordUpsertResponse,
} from "@/domain";
import { Id, Point } from "@/interface";

import { Word } from "./word";

// FOLDER EVENTS

export interface EditFolderNameEvent {
    id: Id;
}

export interface DeleteFolderEvent {
    id: Id;
    name?: string;
    confirm?: boolean;
}

// ENTRY EVENTS

export interface CreateEntryEvent {
    entityType: EntityType;
    title: string;
    folderId: Id;
}

export interface DeleteEntryEvent {
    id: Id;
    title: string;
}

// POLLING

export interface PollEvent {
    syncTitle?: boolean;
    syncProperties?: boolean;
    syncText?: boolean;
    syncLexicon?: boolean;
}

export interface PollResultEntryData {
    id: Id;
    entityType: EntityType;
    title?: string;
    properties?: BaseEntity;
    text?: string;
    words?: Word[];
}

export interface PollResult {
    entries: PollResultEntryData[];
}

// SYNCING

export interface SyncEntryRequest {
    id: Id;
    entityType: EntityType;
    title?: string | null;
    properties?: BaseEntity | null;
    text?: string | null;
    words: Word[] | null;
}

export interface SyncEntryResponse {
    title: EntryTitleUpdateResponse | null;
    text: EntryTextUpdateResponse | null;
    properties: EntryUpdateResponse | null;
    lexicon: WordUpsertResponse[] | null;
}

export interface SyncEntryEvent {
    request: SyncEntryRequest;
    response: SyncEntryResponse;
}

// CONTEXT MENU EVENTS

export interface OpenContextMenuEvent {
    position: Point;
}

export interface OpenFileContextMenuEvent extends OpenContextMenuEvent {
    id: Id;
    text: string;
}
