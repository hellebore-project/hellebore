import type { Id, IdentifiedObject } from "../common";

interface FolderProperties {
    parentId: Id;
    name: string;
}

export type FolderCreate = FolderProperties;

export interface FolderUpdate extends IdentifiedObject {
    parentId: Id | null;
    name: string | null;
}

export interface FolderBulkUpdateData {
    id: Id;
    parentChanged: boolean;
    nameChanged: boolean;
}

export interface FolderUpdateResponse extends FolderUpdate {
    parentChanged: boolean;
    nameChanged: boolean;
}

export type FolderResponse = IdentifiedObject & FolderProperties;

export interface FolderNameCollisionResponse {
    isUnique: boolean;
    collidingFolder: FolderResponse;
}

export interface FolderValidateResponse extends FolderProperties {
    id: number | null;
    nameCollision: FolderNameCollisionResponse | null;
}
