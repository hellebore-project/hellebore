import { IdentifiedObject } from "../common";
import { ArticleNode } from "./article";

export const ROOT_FOLDER_ID = -1;

interface FolderProperties {
    parent_id: number;
    name: string;
}

export type FolderCreate = FolderProperties;

export interface FolderUpdate extends IdentifiedObject {
    parent_id: number | null;
    name: string | null;
}

export interface FolderUpdateResponse extends FolderUpdate {
    parentChanged: boolean;
    nameChanged: boolean;
}

export type FolderResponse = IdentifiedObject & FolderProperties;

export interface FolderNameCollisionResponse {
    collidingFolderId: number;
}

export interface FolderValidateResponse extends FolderProperties {
    id: number | null;
    nameCollision?: FolderNameCollisionResponse | null;
}

export interface FolderNode extends FolderResponse {
    subFolders: { [id: number]: FolderNode };
    articles: { [id: number]: ArticleNode };
}
