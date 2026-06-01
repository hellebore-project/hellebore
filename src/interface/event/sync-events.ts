import { EntryType } from "@/api";

import type { Id } from "../common";
import type {
    BaseEntity,
    EntryUpdateResponse,
    FolderUpdateResponse,
    ProjectResponse,
} from "@/api/interface";
import type { Word } from "../word";

export interface SyncProjectRequest {
    name?: string | null;
}

export interface SyncProjectResponse {
    project: ProjectResponse | null;
}

export interface SyncProjectEvent {
    request: SyncProjectRequest;
    response: SyncProjectResponse;
}

export interface SyncEntryRequest {
    id: Id;
    entryType?: EntryType | null;
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

export interface SyncFolderRequest {
    id: Id;
    parentId: Id;
    name: string;
}

export interface SyncFolderResponse {
    folder: FolderUpdateResponse | null;
}

export interface SyncFolderEvent {
    request: SyncFolderRequest;
    response: SyncFolderResponse;
}

export interface SyncRequest {
    project?: SyncProjectRequest | null;
    entries?: SyncEntryRequest[] | null;
    folders?: SyncFolderRequest[] | null;
}

export interface SyncEvent {
    project?: SyncProjectEvent | null;
    entries?: SyncEntryEvent[];
    folders?: SyncFolderEvent[];
}
