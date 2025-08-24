import { IdentifiedObject } from "@/interface";

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
