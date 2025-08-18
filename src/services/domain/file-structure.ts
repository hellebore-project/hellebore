import {
    EntryInfoResponse,
    BulkData,
    FolderResponse,
    Id,
    ROOT_FOLDER_ID,
} from "@/interface";

export type FileNode = EntryInfoResponse;

export interface FolderNode extends FolderResponse {
    subFolders: { [id: number]: FolderNode };
    files: { [id: number]: FileNode };
}

export class FileStructure {
    folders: { [id: number]: FolderNode };
    /**
     * The high-level information of each file is cached. This information is used for:
     *  - entity type look-ups
     *  - querying entries by title
     *  - updating references in articles (TODO)
     */
    files: { [id: number]: FileNode };

    constructor() {
        this.folders = {};
        this.files = {};

        this.resetFolders();
    }

    getInfo(id: Id): EntryInfoResponse {
        return this.files[id];
    }

    subtree(rootId: number = ROOT_FOLDER_ID) {
        const rootFolder = this.addFolderById(rootId);
        return this._subtree(rootFolder, { entries: [], folders: [] });
    }

    _subtree(folder: FolderNode, data: BulkData) {
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
            node.parent_id = folder.parent_id;
            node.name = folder.name;
        } else {
            node = {
                ...folder,
                subFolders: [],
                files: [],
            };
            this.folders[folder.id] = node;
        }

        const parent = this.addFolderById(folder.parent_id);
        parent.subFolders[node.id] = node;

        return node;
    }

    addFolderById(id: number) {
        if (id in this.folders) return this.folders[id];
        const node: FolderNode = {
            id: id,
            parent_id: ROOT_FOLDER_ID,
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
        const parentNode = this.folders[folderNode.parent_id];

        delete this.folders[id];
        if (parentNode) delete parentNode.subFolders[id];
    }

    addFile(file: EntryInfoResponse) {
        const folder = this.addFolderById(file.folder_id);
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
        const folderNode = this.folders[articleNode.folder_id];

        delete this.files[id];
        if (folderNode) delete folderNode.files[id];
    }

    bulkDelete(data: BulkData) {
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
