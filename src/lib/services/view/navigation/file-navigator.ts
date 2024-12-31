import { TreeMethods } from "@minoru/react-dnd-treeview";
import { makeAutoObservable, toJS } from "mobx";
import { RefObject } from "react";

import {
    ArticleInfoResponse,
    ArticleUpdateResponse,
    FileNodeData,
    FileNodeModel,
    FolderResponse,
    NodeId,
    ROOT_FOLDER_ID,
    ROOT_FOLDER_NODE_ID,
} from "@/interface";
import { ArticleUpdateArguments, DomainService } from "@/services/domain";
import { Counter } from "@/utils/counter";
import {
    articleNodeId,
    convertNodeIdToEntityId,
    folderNodeId,
} from "@/utils/node";

export type UpdateArticleHandler = (
    update: ArticleUpdateArguments,
) => Promise<ArticleUpdateResponse | null>;
export type SelectArticleHandler = (id: number) => void;

export class FileNavigationService {
    _nodes: FileNodeModel[];
    _nodePositionCache: { [nodeId: NodeId]: number };

    /**
     * Reference to the article tree component.
     * Its handlers must be called inside a component function to ensure that the DOM is updated.
     */
    _tree: RefObject<TreeMethods> | null = null;

    expanded: boolean = true;
    hover: boolean = false;
    selectedNode: FileNodeModel | null;

    onSelectedArticle: SelectArticleHandler[];

    _placeholderIdGenerator: Counter;
    domain: DomainService;

    updateArticle: UpdateArticleHandler;

    constructor(domain: DomainService, updateArticle: UpdateArticleHandler) {
        makeAutoObservable(this, {
            _nodePositionCache: false,
            _placeholderIdGenerator: false,
            _tree: false,
            domain: false,
            updateArticle: false,
        });

        this._nodes = [];
        this._nodePositionCache = {};

        this.selectedNode = null;

        this.onSelectedArticle = [];

        this._placeholderIdGenerator = new Counter();
        this.domain = domain;

        this.updateArticle = updateArticle;
    }

    /**
     * Reference to the article tree component.
     * Its handlers must be called inside a component function to ensure that the DOM is updated.
     */
    get tree() {
        return this._tree;
    }

    set tree(ref: RefObject<TreeMethods> | null) {
        this._tree = ref;
    }

    get nodes() {
        return toJS(this._nodes);
    }

    set nodes(nodes: FileNodeModel[]) {
        this._nodes = nodes;
    }

    get selectedNodeId() {
        if (this.selectedNode) return this.selectedNode.id;
        return null;
    }

    get activeFolderId() {
        if (this.selectedNode) {
            let id = this.isFolderNode(this.selectedNode)
                ? this.selectedNode.id
                : this.selectedNode.parent;
            return convertNodeIdToEntityId(id);
        }
        return ROOT_FOLDER_ID;
    }

    get canAddArticle() {
        return this.expanded && this.hover;
    }

    get canAddFolder() {
        return this.expanded && this.hover;
    }

    get canCollapseAllFolders() {
        return this.expanded && this.hover;
    }

    setNode(node: FileNodeModel, index: number) {
        this._nodes[index] = node;
    }

    isFolderNode(node: FileNodeModel) {
        return node.droppable;
    }

    isPlaceholderNode(node: FileNodeModel) {
        return node?.data?.isPlaceholder ?? false;
    }

    setNodeError(node: FileNodeModel, error: string) {
        this._addNodeData(node, { error });
    }

    clearNodeError(node: FileNodeModel) {
        delete node?.data?.error;
    }

    toggleExpanded() {
        this.expanded = !this.expanded;
    }

    setHover(hover: boolean) {
        this.hover = hover;
    }

    setSelectedNode(node: FileNodeModel | null) {
        this.selectedNode = node;
    }

    initialize(articles: ArticleInfoResponse[], folders: FolderResponse[]) {
        this._nodePositionCache = {};

        const nodes: FileNodeModel[] = [];

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
                    folder.parent_id,
                    folder.name,
                ),
            );
        }

        this._nodes = nodes;
    }

    reset() {
        this._nodes = [];
        this._nodePositionCache = {};
    }

    getNode(nodeId: NodeId) {
        const index = this.getNodeIndex(nodeId, true);
        if (index === null) return null;
        return this.nodes[index];
    }

    getNodeIndex(nodeId: NodeId | null, cache: boolean = true): number | null {
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

    addNodeForCreatedArticle({ id, folder_id, title }: ArticleInfoResponse) {
        const node = this._generateArticleNode(id, folder_id, title);
        this._nodes.push(node);
        this.setSelectedNode(node);
    }

    addPlaceholderNodeForNewFolder(): FileNodeModel {
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

        return node;
    }

    selectArticleNode(id: number) {
        const nodeId = articleNodeId(id);
        if (this.selectedNode?.id == nodeId) return;
        const node = this._findNode(nodeId);
        if (node) this.selectNode(node);
    }

    selectNode(node: FileNodeModel) {
        this.setSelectedNode(node);
        if (this.isFolderNode(node)) return;

        const id = convertNodeIdToEntityId(node.id);
        if (!this.isFolderNode(node))
            this.onSelectedArticle.forEach((handler) => handler(id));
    }

    updateArticleNodeText(id: number, title: string) {
        this.setNodeText(articleNodeId(id), title);
    }

    setNodeText(nodeId: NodeId, text: string) {
        const index = this.getNodeIndex(nodeId);
        if (index !== null) this._nodes[index].text = text;
    }

    editNodeText(nodeId: NodeId, text: string) {
        const index = this.getNodeIndex(nodeId);
        if (index !== null) {
            const node = this._nodes[index];

            // update the editable text of the node
            if (!node?.data)
                node.data = { isEditable: true, editableText: text };
            else node.data.editableText = text;

            // update the node collection
            this._nodes[index] = node;

            this.validateEditedNodeText(node);
        }
    }

    async validateEditedNodeText(node: FileNodeModel) {
        const newText = node.data?.editableText ?? "";
        if (!newText) this.setNodeError(node, "A name must be provided.");
        else if (newText != node.text) {
            let id = this.isPlaceholderNode(node)
                ? null
                : convertNodeIdToEntityId(node.id);

            // validate the new text
            if (this.isFolderNode(node)) {
                // folder
                const parentId = convertNodeIdToEntityId(node.parent);
                const validationResponse = this.domain.folders.validate_name(
                    id,
                    parentId,
                    newText,
                );
                if (!validationResponse.nameIsUnique)
                    this.setNodeError(
                        node,
                        `A folder named ${newText} already exists at this location.`,
                    );
                else this.clearNodeError(node);
            } else {
                // article
                // TODO
            }
        } else this.clearNodeError(node);
    }

    async confirmNodeTextEdit(node: FileNodeModel) {
        this.validateEditedNodeText(node);
        if (node.data?.error)
            // cancel the edit
            this._cancelNodeTextEdit(node);
        // apply the edit
        else await this._applyNodeTextEdit(node);
    }

    async _applyNodeTextEdit(node: FileNodeModel) {
        const index = this.getNodeIndex(node.id, false) as number;

        node.text = node?.data?.editableText ?? node.text;
        delete node?.data?.editableText;

        // folder
        if (this.isFolderNode(node)) {
            if (this.isPlaceholderNode(node)) {
                // add new folder
                const parentId = convertNodeIdToEntityId(node.parent);
                const folder = await this.domain.folders.create(
                    node.text,
                    parentId,
                );
                if (folder) {
                    // sync the node ID with the backend
                    node.id = folderNodeId(folder.id);
                    delete node?.data?.isPlaceholder;
                    delete node?.data?.isEditable;
                    this.setNode(node, index);
                    this.setSelectedNode(node);
                } else {
                    this.setSelectedNode(null);
                    this._deleteNodeAtIndex(index);
                }
            } else {
                // update existing folder
                // TODO
            }
        }
        // article
        else {
            // TODO
        }
    }

    _cancelNodeTextEdit(node: FileNodeModel) {
        const index = this.getNodeIndex(node.id, false) as number;
        if (this.isPlaceholderNode(node)) this._deleteNodeAtIndex(index);
        else {
            delete node?.data?.editableText;
            this.clearNodeError(node);
            this.setNode(node, index);
        }
    }

    async moveNode(node: FileNodeModel, destFolderNodeId: NodeId) {
        const index = this.getNodeIndex(node.id);
        if (index !== null) {
            const sourceFolderNodeId = node.parent;

            const id = convertNodeIdToEntityId(node.id);
            const sourceParentId = convertNodeIdToEntityId(sourceFolderNodeId);
            const destParentId = convertNodeIdToEntityId(destFolderNodeId);

            let response: any;
            if (this.isFolderNode(node)) {
                // folder
                response = await this.domain.folders.update({
                    id,
                    parentId: destParentId,
                    oldParentId: sourceParentId,
                });
            } else {
                // article
                response = await this.updateArticle({
                    id,
                    folderId: destParentId,
                    oldFolderId: sourceParentId,
                });
            }
            console.log(response);
            if (response) {
                node.parent = destFolderNodeId;
                this.setNode(node, index);
            } else
                console.error(
                    `Unable to move node ${node.id} to folder ${destFolderNodeId}.`,
                );
            console.log(this.nodes);
        }
    }

    deleteArticleNode(id: number) {
        this._deleteNode(articleNodeId(id));
    }

    deleteFolderNode(id: number) {
        // child nodes should be deleted in separate calls
        this._deleteNode(folderNodeId(id));
    }

    _generateArticleNode(
        id: any,
        folder_id: any,
        title: string,
        data: FileNodeData | undefined = undefined,
    ): FileNodeModel {
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
        data: FileNodeData | undefined = undefined,
    ): FileNodeModel {
        const node = {
            id: folderNodeId(id),
            parent: folderNodeId(parentId, ROOT_FOLDER_NODE_ID),
            text: name,
            droppable: true,
        };
        if (data) this._addNodeData(node, data);
        return node;
    }

    _addNodeData(node: FileNodeModel, data: FileNodeData) {
        if (node.data) node.data = { ...node.data, ...data };
        else node.data = data;
    }

    _findNode(
        nodeId: NodeId | null,
        cache: boolean = true,
    ): FileNodeModel | null {
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

    _deleteNode(nodeId: NodeId) {
        const index = this.getNodeIndex(nodeId, false);
        if (index !== null) {
            this._nodes.splice(index, 1);
            delete this._nodePositionCache[nodeId];
        }
    }

    _deleteNodeAtIndex(index: number): FileNodeModel {
        const node = this._nodes[index];
        if (node) {
            this._nodes.splice(index, 1);
            delete this._nodePositionCache[node.id];
        }
        return node;
    }
}
