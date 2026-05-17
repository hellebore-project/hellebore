import {
    EntryType,
    EntryViewType,
    SidebarSectionType,
    SyncType,
    ViewAction,
} from "@/constants";

import type { Id, Point } from "../common";
import type {
    BaseEntity,
    BulkFileResponse,
    EntryUpdateResponse,
    FolderUpdateResponse,
    ProjectResponse,
} from "../domain";
import type { CentralPanelInfo } from "./service";
import type { Word } from "./word";

// PROJECT EVENTS

export interface CreateProjectEvent {
    name: string;
    dbFilePath: string;
}

export interface ProjectChangeEvent {
    nameChanged?: boolean;
    syncImmediately?: boolean;
}

export interface LoadProjectEvent {
    loaded: boolean;
    project: ProjectResponse | null;
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

// GENERAL DATA EVENTS

export interface DataChangeEvent {
    project?: ProjectChangeEvent | null;
    entries?: EntryChangeEvent[] | null;
}

// POLLING

export interface PollProjectEvent {
    syncName?: boolean;
}

export interface PollEntryEvent {
    id: Id;
    syncTitle?: boolean;
    syncProperties?: boolean;
    syncText?: boolean;
    syncLexicon?: boolean;
}

export interface BasePollEvent {
    type: SyncType;
    immediate?: boolean;
}

export interface PartialPollEvent extends BasePollEvent {
    type: SyncType.PARTIAL;
    project?: PollProjectEvent;
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
    title?: string;
    properties?: BaseEntity;
    text?: string;
    words?: Word[];
}

export interface PollResult {
    project?: PollResultProjectData;
    entries?: PollResultEntryData[];
}

// SYNCING

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
}

export interface ChangeCentralPanelEvent {
    action: ViewAction;
    details: CentralPanelInfo;
}

export interface ChangeEntryEditorViewEvent {
    panelId: string;
    type: EntryViewType;
}

export interface AddSidebarSectionEvent {
    ownerId: string;
}

export interface AddEntryEditorNavigatorEvent extends AddSidebarSectionEvent {
    entry: {
        id: Id;
        type: EntryType | null;
        title: string | null;
    };
    activeView: EntryViewType;
}

export interface ReleaseSidebarSectionEvent {
    ownerId: string;
    type: SidebarSectionType;
}

// CONTEXT MENU EVENTS

export interface OpenContextMenuEvent {
    position: Point;
}

export interface OpenFileContextMenuEvent extends OpenContextMenuEvent {
    id: Id;
    text: string;
}
