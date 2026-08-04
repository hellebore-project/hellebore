import { SyncType } from "@/constants";
import type { BaseEntity, EntryType } from "@/api";

import type { Id } from "../common";
import type { Word } from "../word";

export interface PollProjectRequest {
    syncName?: boolean;
}

export interface PollFolderRequest {
    id: Id;
    syncTitle?: boolean;
}

export interface PollEntryRequest {
    id: Id;
    syncTitle?: boolean;
    syncFolderId?: boolean;
    syncProperties?: boolean;
    syncText?: boolean;
    syncLexicon?: boolean;
}

export interface BasePollRequest {
    type: SyncType;
    immediate?: boolean;
}

export interface PartialPollRequest extends BasePollRequest {
    type: SyncType.PARTIAL;
    project?: PollProjectRequest;
    folders?: PollFolderRequest[];
    entries?: PollEntryRequest[];
}

export interface FullPollRequest extends BasePollRequest {
    type: SyncType.FULL;
}

export type PollRequest = PartialPollRequest | FullPollRequest;

export interface PollResultProjectData {
    id: Id;
    name?: string;
}

export interface PollResultEntryData {
    id: Id;
    entryType?: EntryType | null;
    folderId?: Id;
    title?: string;
    properties?: BaseEntity;
    text?: string;
    words?: Word[];
}

export interface PollResultFolderData {
    id: Id;
    parentId: Id;
    name: string;
}

export interface PollResult {
    project?: PollResultProjectData;
    entries?: PollResultEntryData[];
    folders?: PollResultFolderData[];
}
