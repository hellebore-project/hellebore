import { TreeMethods } from "@minoru/react-dnd-treeview";
import { ask } from "@tauri-apps/plugin-dialog";
import { makeAutoObservable, toJS } from "mobx";
import { RefObject } from "react";

import {
    ArticleInfoResponse,
    FileNodeData,
    FileNodeModel,
    FolderResponse,
    NodeId,
    ROOT_FOLDER_ID,
    ROOT_FOLDER_NODE_ID,
} from "@/interface";
import { Counter } from "@/utils/counter";
import {
    articleNodeId,
    convertNodeIdToEntityId,
    folderNodeId,
} from "@/utils/node";
import { ViewManagerInterface } from "../view-manager-interface";

export class FileNavigator {
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

    _placeholderIdGenerator: Counter;
    view: ViewManagerInterface;

    constructor(view: ViewManagerInterface) {
        makeAutoObservable(this, {
            _nodePositionCache: false,
            _placeholderIdGenerator: false,
            _tree: false,
            view: false,
        });

        this._nodes = [];
        this._nodePositionCache = {};

        this.selectedNode = null;

        this._placeholderIdGenerator = new Counter();
        this.view = view;
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
        else {
            const id = convertNodeIdToEntityId(node.id);
            this.view.openArticleEditorForId(id);
        }
    }

    updateArticleNodeText(id: number, title: string) {
        this.setNodeText(articleNodeId(id), title);
    }

    setNodeText(nodeId: NodeId, text: string) {
        const index = this.getNodeIndex(nodeId);
        if (index !== null) this._nodes[index].text = text;
    }

    editFolderNodeText(id: number) {
        this.editNodeText(folderNodeId(id));
    }

    editNodeText(nodeId: NodeId) {
        const index = this.getNodeIndex(nodeId);
        if (index === null) return;

        const node = this._nodes[index];

        if (!node.data) node.data = {};
        node.data.isEditable = true;
        node.data.editableText = node.text;

        this._nodes[index] = node;
    }

    setEditableNodeText(nodeId: NodeId, text: string) {
        const index = this.getNodeIndex(nodeId);
        if (index === null) return;

        const node = this._nodes[index];

        // update the editable text of the node
        if (!node?.data) node.data = { isEditable: true, editableText: text };
        else node.data.editableText = text;

        // update the node collection
        this._nodes[index] = node;

        this.validateEditedNodeText(node);
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
                const validationResponse = this.view.domain.folders.validate(
                    id,
                    parentId,
                    newText,
                );
                if (validationResponse.nameCollision)
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
        // NOTE: the node must be refreshed AFTER all of its properties have been updated

        const index = this.getNodeIndex(node.id, false) as number;
        const newText = node?.data?.editableText ?? node.text;

        // folder
        if (this.isFolderNode(node)) {
            if (this.isPlaceholderNode(node)) {
                // add new folder
                const parentId = convertNodeIdToEntityId(node.parent);
                const folder = await this.view.domain.folders.create(
                    newText,
                    parentId,
                );

                if (folder) {
                    // sync the node ID with the backend
                    node.id = folderNodeId(folder.id);
                    node.text = newText;
                    delete node?.data?.isPlaceholder;
                    delete node?.data?.isEditable;
                    delete node?.data?.editableText;
                    this.setSelectedNode(node);
                    // force a refresh
                    this.setNode(node, index);
                } else {
                    // failed to create a new folder in the backend
                    this.setSelectedNode(null);
                    this._deleteNodeAtIndex(index);
                }
            } else {
                // update existing folder
                const folder = await this.view.domain.folders.update({
                    id: convertNodeIdToEntityId(node.id),
                    name: newText,
                });

                if (folder) {
                    node.text = newText;
                    delete node?.data?.isEditable;
                    delete node?.data?.editableText;
                    // force a refresh
                    this.setNode(node, index);
                }
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
        let index = this.getNodeIndex(node.id);
        if (index === null) return;

        const sourceFolderNodeId = node.parent;

        const id = convertNodeIdToEntityId(node.id);
        const sourceParentId = convertNodeIdToEntityId(sourceFolderNodeId);
        const destParentId = convertNodeIdToEntityId(destFolderNodeId);

        let response: any;
        if (this.isFolderNode(node)) {
            // folder
            const validateResponse = this.view.domain.folders.validate(
                id,
                destParentId,
                node.text,
            );
            if (validateResponse.nameCollision) {
                const replace = await ask(
                    `A folder with the name '${node.text}' already exists in the destination folder. Do you want to replace it?`,
                    {
                        title: "Folder name collision",
                        kind: "warning",
                    },
                );
                if (!replace) return;

                const deleteResponse = await this.view.deleteFolder(
                    validateResponse.nameCollision.collidingFolderId,
                    false,
                );
                if (!deleteResponse) {
                    console.error(
                        "Failed to delete colliding folder. Aborting move.",
                    );
                    return;
                }

                // need to fetch the index of the node again because the original index may be outdated following the delete request
                index = this.getNodeIndex(node.id) as number;
            }

            response = await this.view.domain.folders.update({
                id,
                parentId: destParentId,
                oldParentId: sourceParentId,
            });
        } else {
            // article
            response = await this.view.updateArticle({
                id,
                folderId: destParentId,
                oldFolderId: sourceParentId,
            });
        }

        if (response) {
            node.parent = destFolderNodeId;
            // setting the node at its current index forces a refresh of the tree component
            this.setNode(node, index);
        } else
            console.error(
                `Unable to move node ${node.id} to folder ${destFolderNodeId}.`,
            );
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
