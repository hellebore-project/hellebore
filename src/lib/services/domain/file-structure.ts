import {
    ArticleInfoResponse,
    ArticleNode,
    BulkData,
    FolderNode,
    FolderResponse,
    ROOT_FOLDER_ID,
} from "@/interface";

export class FileStructure {
    folders: { [id: number]: FolderNode };
    /**
     * The high-level information of each article is cached. This information is used for:
     *  - entity type look-ups
     *  - querying articles by title
     *  - updating references in article bodies (TODO)
     */
    articles: { [id: number]: ArticleNode };

    constructor() {
        this.folders = {};
        this.articles = {};

        this.addFolderById(ROOT_FOLDER_ID);
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
                articles: [],
            };
            this.folders[folder.id] = node;
        }

        const parent = this.addFolderById(folder.parent_id);
        parent.subFolders[node.id] = node;

        return node;
    }

    addFolderById(id: number) {
        if (id in this.folders) return this.folders[id];
        const node = {
            id: id,
            parent_id: ROOT_FOLDER_ID,
            name: "",
            subFolders: [],
            articles: [],
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

    addArticle(article: ArticleInfoResponse) {
        const folder = this.addFolderById(article.folder_id);
        folder.articles[article.id] = article;
        this.articles[article.id] = article;
    }

    moveArticle(id: number, sourceId: number, destId: number) {
        const sourceNode = this.addFolderById(sourceId);
        const destNode = this.addFolderById(destId);

        destNode.articles[id] = sourceNode.articles[id];
        delete sourceNode.articles[id];
    }

    deleteArticle(id: number) {
        const articleNode = this.articles[id];
        const folderNode = this.folders[articleNode.folder_id];

        delete this.articles[id];
        if (folderNode) delete folderNode.articles[id];
    }

    collectFileIds(rootId: number = ROOT_FOLDER_ID) {
        const rootFolder = this.addFolderById(rootId);
        return this._collectFileIds(rootFolder, { articles: [], folders: [] });
    }

    _collectFileIds(folder: FolderNode, bulkData: BulkData) {
        bulkData.folders.push(folder.id);
        for (const subFolder of Object.values(folder.subFolders))
            this._collectFileIds(subFolder, bulkData);
        for (const articleId of Object.keys(folder.articles))
            bulkData.articles.push(Number(articleId));
        return bulkData;
    }

    reset() {
        this.folders = {};
    }
}
