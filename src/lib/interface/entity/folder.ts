import { IdentifiedObject } from "../common";

export const ROOT_FOLDER_ID = -1;

export interface FolderInfo {
    parent_id: number;
    name: string;
}

export interface FolderUpdate extends IdentifiedObject {
    info: FolderInfo;
}

export interface FolderResponse extends FolderUpdate {}
