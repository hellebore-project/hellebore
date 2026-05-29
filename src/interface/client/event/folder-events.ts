import type { Id } from "@/interface/common";
import type { BulkFileResponse, FolderUpdateResponse } from "@/api/interface";

export interface EditFolderNameEvent {
    id: Id;
}

export interface FolderCreationEvent {
    name: string;
    parentFolderId: Id;
}

export interface FolderChangeEvent {
    id: Id;
    titleChanged?: boolean;
    syncImmediately?: boolean;
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
