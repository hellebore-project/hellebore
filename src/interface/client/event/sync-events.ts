import { EntryType } from "@/constants";

import type { Id } from "../../common";
import type {
    BaseEntity,
    EntryUpdateResponse,
    ProjectResponse,
} from "../../domain";
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

export interface SyncRequest {
    project?: SyncProjectRequest | null;
    entries?: SyncEntryRequest[] | null;
}

export interface SyncEvent {
    project?: SyncProjectEvent | null;
    entries?: SyncEntryEvent[];
}
