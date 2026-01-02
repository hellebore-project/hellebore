import {
    BaseEntity,
    BulkFileResponse,
    EntryType,
    EntryUpdateResponse,
    FolderUpdateResponse,
    WordType,
} from "@/domain";
import { Id, Point } from "@/interface";

import { Word } from "./word";
import { EntryViewType, ViewAction } from "../constants";
import { CentralPanelInfo } from "./central-panel";

// PROJECT EVENTS

export interface CreateProjectEvent {
    name: string;
    dbFilePath: string;
}

// FOLDER EVENTS

export interface EditFolderNameEvent {
    id: Id;
}

export interface MoveFolderEvent {
    id: Id;
    title: string;
    sourceParentId: Id;
    destParentId: Id;
    confirm?: boolean;
}

export interface MoveFolderResult {
    moved: boolean;
    cancelled: boolean;
    update: FolderUpdateResponse | null;
    deletion: BulkFileResponse | null;
}

export interface DeleteFolderEvent {
    id: Id;
    name?: string;
    confirm?: boolean;
}

// ENTRY EVENTS

export interface CreateEntryEvent {
    entryType: EntryType;
    title: string;
    folderId: Id;
}

export interface ChangeEntryEvent {
    id: Id;
    poll?: PollEvent;
}

export interface DeleteEntryEvent {
    id: Id;
    title: string;
}

// POLLING

export interface PollEvent {
    id?: Id | null;
    syncTitle?: boolean;
    syncProperties?: boolean;
    syncText?: boolean;
    syncLexicon?: boolean;
}

export interface PollResultEntryData {
    id: Id;
    entryType: EntryType;
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
    entryType: EntryType;
    folderId?: Id | null;
    title?: string | null;
    properties?: BaseEntity | null;
    text?: string | null;
    words: Word[] | null;
}

export interface SyncEntryResponse {
    entry: EntryUpdateResponse | null;
}

export interface SyncEntryEvent {
    request: SyncEntryRequest;
    response: SyncEntryResponse;
}

export interface SyncEvent {
    entries: SyncEntryEvent[];
}

// VIEW EVENTS

export interface OpenEntryCreatorEvent {
    entryType?: EntryType;
    folderId?: Id;
}

interface OpenCentralPanelEvent {
    focus?: boolean;
}

export interface OpenEntryEditorEvent extends OpenCentralPanelEvent {
    id: Id;
    viewKey?: EntryViewType;
    wordType?: WordType;
}

export interface ChangeCentralPanelEvent {
    action: ViewAction;
    details: CentralPanelInfo;
}

// CONTEXT MENU EVENTS

export interface OpenContextMenuEvent {
    position: Point;
}

export interface OpenFileContextMenuEvent extends OpenContextMenuEvent {
    id: Id;
    text: string;
}
