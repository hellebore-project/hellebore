import { EntryType, SyncType } from "@/constants";
import type { Id } from "@/interface/common";
import type { BaseEntity } from "@/api/interface";

import type { Word } from "../word";

export interface PollProjectEvent {
    syncName?: boolean;
}

export interface PollEntryEvent {
    id: Id;
    syncTitle?: boolean;
    syncFolderId?: boolean;
    syncProperties?: boolean;
    syncText?: boolean;
    syncLexicon?: boolean;
}

export interface PollFolderEvent {
    id: Id;
    syncTitle?: boolean;
}

export interface BasePollEvent {
    type: SyncType;
    immediate?: boolean;
}

export interface PartialPollEvent extends BasePollEvent {
    type: SyncType.PARTIAL;
    project?: PollProjectEvent;
    folders?: PollFolderEvent[];
    entries?: PollEntryEvent[];
}

export interface FullPollEvent extends BasePollEvent {
    type: SyncType.FULL;
}

export type PollEvent = PartialPollEvent | FullPollEvent;

export interface PollResultProjectData {
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
