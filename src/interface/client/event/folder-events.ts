import type { Id } from "../../common";
import type { BulkFileResponse, FolderUpdateResponse } from "../../domain";

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
