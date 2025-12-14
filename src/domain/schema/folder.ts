import { IdentifiedObject } from "@/interface";

interface FolderProperties {
    parentId: number;
    name: string;
}

export type FolderCreate = FolderProperties;

export interface FolderUpdate extends IdentifiedObject {
    parentId: number | null;
    name: string | null;
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
