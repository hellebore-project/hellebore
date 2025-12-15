import { ROOT_FOLDER_ID } from "@/domain/constants";
import { Id } from "@/interface";
import {
    BulkFileData,
    EntryInfoResponse,
    FolderResponse,
} from "@/domain/schema";

export type FileNode = EntryInfoResponse;

export interface FolderNode extends FolderResponse {
    subFolders: Record<number, FolderNode>;
    files: Record<number, FileNode>;
}

export class FileStructure {
    // TODO: use Maps instead of vanilla objects
    folders: Record<number, FolderNode>;
    files: Record<number, FileNode>;

    constructor() {
        this.folders = {};
        this.files = {};

        this.resetFolders();
    }

    getEntry(id: Id): EntryInfoResponse {
        return this.files[id];
    }

    subtree(rootId: number = ROOT_FOLDER_ID) {
        const rootFolder = this.addFolderById(rootId);
        return this._subtree(rootFolder, { entries: [], folders: [] });
    }

    _subtree(folder: FolderNode, data: BulkFileData) {
        data.folders.push(folder.id);
        for (const subFolder of Object.values(folder.subFolders))
            this._subtree(subFolder, data);
        for (const entryId of Object.keys(folder.files))
            data.entries.push(Number(entryId));
        return data;
    }

    addFolder(folder: FolderResponse) {
        let node: FolderNode;

        if (folder.id in this.folders) {
            node = this.folders[folder.id];
            node.parentId = folder.parentId;
            node.name = folder.name;
        } else {
            node = {
                ...folder,
                subFolders: [],
                files: [],
            };
            this.folders[folder.id] = node;
        }

        const parent = this.addFolderById(folder.parentId);
        parent.subFolders[node.id] = node;

        return node;
    }

    addFolderById(id: number) {
        if (id in this.folders) return this.folders[id];
        const node: FolderNode = {
            id: id,
            parentId: ROOT_FOLDER_ID,
            name: "",
            subFolders: [],
            files: [],
        };
        this.folders[id] = node;
        return node;
    }

    moveFolder(id: number, sourceId: number, destId: number) {
        const sourceNode = this.addFolderById(sourceId);
        delete sourceNode.subFolders[id];

        const parentNode = this.addFolderById(destId);
        parentNode.subFolders[id] = this.addFolderById(id);
    }

    deleteFolder(id: number) {
        const folderNode = this.folders[id];
        const parentNode = this.folders[folderNode.parentId];

        delete this.folders[id];
        if (parentNode) delete parentNode.subFolders[id];
    }

    addFile(file: EntryInfoResponse) {
        const folder = this.addFolderById(file.folderId);
        folder.files[file.id] = file;
        this.files[file.id] = file;
    }

    moveFile(id: number, sourceId: number, destId: number) {
        const sourceNode = this.addFolderById(sourceId);
        const destNode = this.addFolderById(destId);

        destNode.files[id] = sourceNode.files[id];
        delete sourceNode.files[id];
    }

    deleteFile(id: number) {
        const articleNode = this.files[id];
        const folderNode = this.folders[articleNode.folderId];

        delete this.files[id];
        if (folderNode) delete folderNode.files[id];
    }

    bulkDelete(data: BulkFileData) {
        for (const entryId of data.entries) this.deleteFile(entryId);
        for (const folderId of data.folders) {
            if (folderId === ROOT_FOLDER_ID) continue;
            this.deleteFolder(folderId);
        }
    }

    resetFolders() {
        this.folders = {};
        this.addFolderById(ROOT_FOLDER_ID);
    }
}
