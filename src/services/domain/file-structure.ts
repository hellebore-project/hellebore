import {
    EntityInfoResponse,
    BulkData,
    FolderResponse,
    Id,
    ROOT_FOLDER_ID,
} from "@/interface";

export type FileNode = EntityInfoResponse;

export interface FolderNode extends FolderResponse {
    subFolders: { [id: number]: FolderNode };
    files: { [id: number]: FileNode };
}

export class FileStructure {
    folders: { [id: number]: FolderNode };
    /**
     * The high-level information of each file is cached. This information is used for:
     *  - entity type look-ups
     *  - querying articles by title
     *  - updating references in article bodies (TODO)
     */
    files: { [id: number]: FileNode };

    constructor() {
        this.folders = {};
        this.files = {};

        this.addFolderById(ROOT_FOLDER_ID);
    }

    getInfo(id: Id): EntityInfoResponse {
        return this.files[id];
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

    addFile(file: EntityInfoResponse) {
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

    collectFileIds(rootId: number = ROOT_FOLDER_ID) {
        const rootFolder = this.addFolderById(rootId);
        return this._collectFileIds(rootFolder, { articles: [], folders: [] });
    }

    _collectFileIds(folder: FolderNode, bulkData: BulkData) {
        bulkData.folders.push(folder.id);
        for (const subFolder of Object.values(folder.subFolders))
            this._collectFileIds(subFolder, bulkData);
        for (const entityId of Object.keys(folder.files))
            bulkData.articles.push(Number(entityId));
        return bulkData;
    }

    reset() {
        this.folders = {};
    }
}
