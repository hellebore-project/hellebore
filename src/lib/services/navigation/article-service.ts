import { makeAutoObservable, toJS } from "mobx";

import {
    ArticleInfoResponse,
    ArticleNodeData,
    ArticleNodeModel,
    FolderResponse,
    NodeId,
    ROOT_FOLDER_ID,
    ROOT_FOLDER_NODE_ID,
} from "../../interface";
import {
    articleNodeId,
    convertNodeIdToEntityId,
    folderNodeId,
} from "../../utils/node";
import { DomainService } from "../domain";
import { Counter } from "../../utils/counter";

export type SelectArticleHandler = (id: number) => void;
export type SelectFolderHandler = (id: number) => void;

export class ArticleNavigationService {
    _nodes: ArticleNodeModel[];
    _nodePositionCache: { [nodeId: NodeId]: number };

    expanded: boolean = true;
    hover: boolean = false;
    selectedNode: ArticleNodeModel | null;

    onSelectedArticle: SelectArticleHandler[];
    onSelectedFolder: SelectFolderHandler[];

    _placeholderIdGenerator: Counter;
    domain: DomainService;

    constructor(domain: DomainService) {
        makeAutoObservable(this, {
            _nodePositionCache: false,
            _placeholderIdGenerator: false,
            domain: false,
        });

        this._nodes = [];
        this._nodePositionCache = {};

        this.selectedNode = null;

        this.onSelectedArticle = [];
        this.onSelectedFolder = [];

        this._placeholderIdGenerator = new Counter();
        this.domain = domain;
    }

    get nodes() {
        return toJS(this._nodes);
    }

    set nodes(nodes: ArticleNodeModel[]) {
        this._nodes = nodes;
    }

    get selectedNodeId() {
        if (this.selectedNode) return this.selectedNode.id;
        return null;
    }

    get activeFolderId() {
        if (this.selectedNode) {
            let id: NodeId;
            if (this.selectedNode.droppable)
                // folder
                id = this.selectedNode.id;
            // article
            else id = this.selectedNode.parent;
            return convertNodeIdToEntityId(id);
        }
        return ROOT_FOLDER_ID;
    }

    get canAddFolder() {
        return this.expanded && this.hover;
    }

    setNode(node: ArticleNodeModel, index: number) {
        this._nodes[index] = node;
    }

    toggleExpanded() {
        this.expanded = !this.expanded;
    }

    setHover(hover: boolean) {
        this.hover = hover;
    }

    setSelectedNode(node: ArticleNodeModel | null) {
        this.selectedNode = node;
    }

    setup(articles: ArticleInfoResponse[], folders: FolderResponse[]) {
        const nodes: ArticleNodeModel[] = [];

        for (let article of articles) {
            nodes.push(
                this._generateArticleNode(
                    article.id,
                    article.folder_id,
                    article.title,
                ),
            );
        }
        for (let folder of folders) {
            nodes.push(
                this._generateFolderNode(
                    folder.id,
                    folder.info.parent_id,
                    folder.info.name,
                ),
            );
        }

        this._nodes = nodes;
    }

    addNodeForCreatedArticle({ id, folder_id, title }: ArticleInfoResponse) {
        const node = this._generateArticleNode(id, folder_id, title);
        this._nodes.push(node);
        this.setSelectedNode(node);
    }

    addPlaceholderNodeForNewFolder() {
        const id = this._placeholderIdGenerator.increment();
        const node = this._generateFolderNode(
            `P${id}`,
            this.activeFolderId,
            "",
            {
                isPlaceholder: true,
                isEditable: true,
                editableText: "",
            },
        );

        this._nodePositionCache[node.id] = this._nodes.length;
        this._nodes.push(node);
        this.selectedNode = node;
    }

    selectArticleNode(id: number) {
        const nodeId = articleNodeId(id);
        if (this.selectedNode?.id == nodeId) return;
        const node = this._findNode(nodeId);
        if (node) this.selectNode(node);
    }

    selectNode(node: ArticleNodeModel) {
        this.setSelectedNode(node);
        if (node?.data?.isPlaceholder ?? false) return;

        const id = convertNodeIdToEntityId(node.id);
        if (node.droppable)
            // folder
            this.onSelectedFolder.forEach((handler) => handler(id));
        // article
        else this.onSelectedArticle.forEach((handler) => handler(id));
    }

    updateArticleNodeText(id: number, title: string) {
        this.setNodeText(articleNodeId(id), title);
    }

    setNodeText(nodeId: NodeId, text: string) {
        const index = this._getNodeIndex(nodeId);
        if (index !== null) this._nodes[index].text = text;
    }

    editNodeText(nodeId: NodeId, text: string) {
        const index = this._getNodeIndex(nodeId);
        if (index !== null) {
            const node = this._nodes[index];
            if (!node?.data)
                node.data = { isEditable: true, editableText: text };
            else node.data.editableText = text;
            this._nodes[index] = node;
        }
    }

    async confirmEditingNodeText(node: ArticleNodeModel) {
        node.text = node?.data?.editableText ?? node.text;
        delete node?.data?.editableText;

        if (node.droppable) {
            // folder

            if (node?.data?.isPlaceholder ?? false) {
                // add new folder
                const parentId = convertNodeIdToEntityId(node.parent);
                const folder = await this.domain.folders.create(
                    node.text,
                    parentId,
                );

                const index = this._getNodeIndex(node.id, false) as number;

                if (folder) {
                    // sync the node ID with the backend
                    node.id = folder.id;
                    delete node?.data?.isPlaceholder;
                    delete node?.data?.isEditable;
                    this.setNode(node, index);
                    this.setSelectedNode(node);
                } else {
                    this._deleteNodeAtIndex(index);
                    this.setSelectedNode(null);
                }
            } else {
                // update existing folder
                // TODO
            }
        } else {
            // article
            // TODO
        }
    }

    moveNode(node: ArticleNodeModel, folderNodeId: NodeId) {
        const index = this._getNodeIndex(node.id);
        if (index !== null) {
            node.parent = folderNodeId;
            this._nodes[index] = node;

            const id = convertNodeIdToEntityId(node.id);
            const parentId = convertNodeIdToEntityId(node.parent);

            if (node.droppable)
                // folder
                this.domain.folders.update(id, node.text, parentId);
        }
    }

    _generateArticleNode(
        id: any,
        folder_id: any,
        title: string,
        data: ArticleNodeData | undefined = undefined,
    ): ArticleNodeModel {
        const node = {
            id: articleNodeId(id),
            parent: folderNodeId(folder_id, ROOT_FOLDER_NODE_ID),
            text: title,
        };
        if (data) this._addNodeData(node, data);
        return node;
    }

    _generateFolderNode(
        id: any,
        parentId: any,
        name: string,
        data: ArticleNodeData | undefined = undefined,
    ): ArticleNodeModel {
        const node = {
            id: folderNodeId(id),
            parent: folderNodeId(parentId, ROOT_FOLDER_NODE_ID),
            text: name,
            droppable: true,
        };
        if (data) this._addNodeData(node, data);
        return node;
    }

    _addNodeData(node: ArticleNodeModel, data: ArticleNodeData) {
        if (node.data) node.data = { ...node.data, ...data };
        else node.data = data;
    }

    _findNode(
        nodeId: NodeId | null,
        cache: boolean = true,
    ): ArticleNodeModel | null {
        if (!nodeId) return null;

        let index = this._nodePositionCache[nodeId];
        let node = this._nodes[index];

        if (node && node.id == nodeId) return node;

        index = 0;
        for (let node of this._nodes) {
            if (node.id != nodeId) {
                index++;
                continue;
            }
            if (cache) this._nodePositionCache[nodeId] = index;
            return node;
        }

        return null;
    }

    _getNodeIndex(nodeId: NodeId | null, cache: boolean = true): number | null {
        if (!nodeId) return null;

        let index = this._nodePositionCache[nodeId];
        let node = this._nodes[index];

        if (node && node.id == nodeId) return index;

        index = 0;
        for (let node of this._nodes) {
            if (node.id != nodeId) {
                index++;
                continue;
            }
            if (cache) this._nodePositionCache[nodeId] = index;
            return index;
        }

        return null;
    }

    _deleteNode(nodeId: NodeId) {
        const index = this._getNodeIndex(nodeId, false);
        if (index !== null) {
            this._nodes.splice(index, 1);
            delete this._nodePositionCache[nodeId];
        }
    }

    _deleteNodeAtIndex(index: number) {
        const node = this._nodes[index];
        if (node) {
            this._nodes.splice(index, 1);
            delete this._nodePositionCache[node.id];
        }
    }
}
