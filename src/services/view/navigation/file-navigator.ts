import { TreeMethods } from "@minoru/react-dnd-treeview";
import { ask } from "@tauri-apps/plugin-dialog";
import { makeAutoObservable, toJS } from "mobx";
import { createRef, RefObject, useEffect } from "react";

import {
    EntryInfoResponse,
    FileNodeData,
    FileNodeModel,
    FolderResponse,
    Id,
    NodeId,
    ROOT_FOLDER_ID,
    ROOT_FOLDER_NODE_ID,
} from "@/interface";
import { Counter } from "@/utils/counter";
import { ViewManagerInterface } from "../interface";
import { OutsideEventHandlerService } from "@/shared/outside-event-handler";
import { NavigatorErrorManager } from "./navigator-error-manager";

type PrivateKeys = "_nodePositionCache" | "_tree";

export class FileNavigator {
    NODE_DOM_ID_PREFIX = "file-nav-node-";
    NODE_TEXT_DOM_ID_PREFIX = "file-nav-node-text-";

    private _nodes: FileNodeModel[];
    private _nodePositionCache: { [nodeId: NodeId]: number };
    private _expanded: boolean = true;
    private _focused: boolean = false;
    private _hover: boolean = false;
    private _selectedNode: FileNodeModel | null = null;
    private _openedNode: FileNodeModel | null = null;

    /**
     * Reference to the file tree element.
     * Its handlers must be called inside a component function to ensure that the DOM is updated.
     */
    private _tree: RefObject<TreeMethods>;
    private _editableTextField: RefObject<HTMLInputElement> | null = null;

    _placeholderIdGenerator: Counter;
    outsideEventHandler: OutsideEventHandlerService;
    errorManager: NavigatorErrorManager;
    view: ViewManagerInterface;

    constructor(view: ViewManagerInterface) {
        makeAutoObservable<FileNavigator, PrivateKeys>(this, {
            _nodePositionCache: false,
            _placeholderIdGenerator: false,
            _tree: false,
            outsideEventHandler: false,
            errorManager: false,
            view: false,
        });

        this._nodes = [];
        this._nodePositionCache = {};

        this._tree = createRef();

        this._placeholderIdGenerator = new Counter();
        this.outsideEventHandler = new OutsideEventHandlerService({
            onOutsideEvent: () => {
                this.focused = false;
                this.selectedNode = null;
            },
            enabled: true,
        });
        this.errorManager = new NavigatorErrorManager(this);
        this.view = view;
    }

    get width() {
        return this.view.navbarWidth;
    }

    /**
     * Reference to the file tree element.
     * Its handlers must be called inside a component function to ensure that the DOM is updated.
     */
    get tree() {
        return this._tree;
    }

    set tree(ref: RefObject<TreeMethods>) {
        this._tree = ref;
    }

    get editableTextField() {
        return this._editableTextField;
    }

    set editableTextField(ref: RefObject<HTMLInputElement> | null) {
        this._editableTextField = ref;
    }

    get nodes() {
        return toJS(this._nodes);
    }

    set nodes(nodes: FileNodeModel[]) {
        this._nodes = nodes;
    }

    get selectedNode() {
        return this._selectedNode;
    }

    set selectedNode(node: FileNodeModel | null) {
        this._selectedNode = node;
    }

    get selectedNodeId() {
        if (this._selectedNode) return this._selectedNode.id;
        return null;
    }

    get openedNode() {
        return this._openedNode;
    }

    set openedNode(node: FileNodeModel | null) {
        this._openedNode = node;
    }

    get openedNodeId() {
        if (this._openedNode) return this._openedNode.id;
        return null;
    }

    get activeFolderId() {
        if (this.selectedNode) {
            let id = this.isFolderNode(this.selectedNode)
                ? this.selectedNode.id
                : this.selectedNode.parent;
            return this.convertNodeIdToEntityId(id);
        }
        return ROOT_FOLDER_ID;
    }

    get expanded() {
        return this._expanded;
    }

    set expanded(expanded: boolean) {
        if (!expanded) {
            this.focused = false;
            this.selectedNode = null;
        }

        this._expanded = expanded;
    }

    get focused() {
        return this._focused;
    }

    set focused(focused: boolean) {
        this._focused = focused;
    }

    get hover() {
        return this._hover;
    }

    set hover(hover: boolean) {
        this._hover = hover;
    }

    get canAddEntity() {
        return this.expanded && this.hover;
    }

    get canAddFolder() {
        return this.expanded && this.hover;
    }

    get canCollapseAllFolders() {
        return this.expanded && this.hover;
    }

    initialize(entities: EntryInfoResponse[], folders: FolderResponse[]) {
        this._nodePositionCache = {};

        const nodes: FileNodeModel[] = [];

        for (let entity of entities) {
            nodes.push(
                this._generateEntityNode(
                    entity.id,
                    entity.folder_id,
                    entity.title,
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

    // ID CONVERSION

    convertNodeIdToEntityId(id: NodeId): number {
        if (id === ROOT_FOLDER_NODE_ID) return ROOT_FOLDER_ID;
        const _id = id.toString();
        return Number(_id.slice(1));
    }

    convertNodeIdToDOMId(id: NodeId): string {
        return `${this.NODE_DOM_ID_PREFIX}${id}`;
    }

    convertDOMIdToNodeId(elementId: string): NodeId {
        return elementId.slice(this.NODE_DOM_ID_PREFIX.length);
    }

    convertNodeIdToDOMTextId(id: NodeId): string {
        return `${this.NODE_TEXT_DOM_ID_PREFIX}${id}`;
    }

    convertDOMTextIdToNodeId(elementId: string): NodeId {
        return elementId.slice(this.NODE_TEXT_DOM_ID_PREFIX.length);
    }

    // NAVIGATOR STATE

    toggleExpanded() {
        this.expanded = !this.expanded;
    }

    // NODE FETCHING

    getNode(nodeId: NodeId) {
        const index = this.getNodeIndex(nodeId, true);
        if (index === null) return null;
        return this.nodes[index];
    }

    setNode(node: FileNodeModel, index: number) {
        this._nodes[index] = node;
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

    // NODE TYPE

    isFolderNode(node: FileNodeModel) {
        return node.droppable;
    }

    isPlaceholderNode(node: FileNodeModel) {
        return node?.data?.isPlaceholder ?? false;
    }

    // NODE TEXT

    updateEntityNodeText(id: Id, title: string) {
        this.setNodeText(convertEntryIdToNodeId(id), title);
    }

    setNodeText(nodeId: NodeId, text: string) {
        const index = this.getNodeIndex(nodeId);
        if (index !== null) this._nodes[index].text = text;
    }

    // NODE TEXT EDITING

    toggleFolderAsEditable(id: Id) {
        this._toggleNodeIdAsEditable(convertFolderIdToNodeId(id));
    }

    private _toggleNodeIdAsEditable(nodeId: NodeId) {
        const index = this.getNodeIndex(nodeId);
        if (index === null) {
            console.error(`File node ${nodeId} not found.`);
            return;
        }

        const node = this._nodes[index];
        this._toggleNodeAsEditable(node, index, node.text);
    }

    private _toggleNodeAsEditable(
        node: FileNodeModel,
        index: number | null = null,
        text: string = "",
    ) {
        this._addNodeData(node, { isEditable: true, editableText: text });

        this._editableTextField = createRef();

        if (index === null) {
            index = this._nodes.length;
            this._nodes.push(node); // add node to state
        } else this._nodes[index] = node; // force rerender

        this._nodePositionCache[node.id] = index;

        this.selectedNode = node; // select the node
        this.focused = true;
    }

    private _toggleNodeAsReadOnly(node: FileNodeModel) {
        delete node?.data?.isEditable;
        delete node?.data?.editableText;
    }

    setEditableNodeText(nodeId: NodeId, text: string) {
        const index = this.getNodeIndex(nodeId);
        if (index === null) return;

        const node = this._nodes[index];
        if (!node.data || !node.data.isEditable)
            // node is not editable
            return;

        // update the editable text of the node
        node.data.editableText = text;

        // update the node collection
        this._nodes[index] = node;

        this._validateEditedNodeText(node);
    }

    private async _validateEditedNodeText(node: FileNodeModel) {
        const newText = node.data?.editableText ?? "";
        if (!newText) this.setNodeError(node, "A name must be provided.");
        else if (newText != node.text) {
            let id = this.isPlaceholderNode(node)
                ? null
                : this.convertNodeIdToEntityId(node.id);

            // validate the new text
            if (this.isFolderNode(node)) {
                // folder
                const parentId = this.convertNodeIdToEntityId(node.parent);
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
                // entity
                // TODO
            }
        } else this.clearNodeError(node);
    }

    async confirmNodeTextEdit(node: FileNodeModel) {
        this._validateEditedNodeText(node);
        if (node.data?.error)
            // cancel the edit
            this._cancelNodeTextEdit(node);
        // apply the edit
        else await this._applyNodeTextEdit(node);
        this._endNodeTextEdit(node);
    }

    private async _applyNodeTextEdit(node: FileNodeModel) {
        // NOTE: the node must be refreshed AFTER all of its properties have been updated

        const index = this.getNodeIndex(node.id, false) as number;
        const newText = node?.data?.editableText ?? node.text;

        // folder
        if (this.isFolderNode(node)) {
            if (this.isPlaceholderNode(node)) {
                // add new folder
                const parentId = this.convertNodeIdToEntityId(node.parent);
                const folder = await this.view.domain.folders.create(
                    newText,
                    parentId,
                );

                if (folder) {
                    // sync the node ID with the backend
                    node.id = convertFolderIdToNodeId(folder.id);
                    node.text = newText;
                    delete node?.data?.isPlaceholder;
                    this._toggleNodeAsReadOnly(node);
                    this.selectedNode = node;
                    // force a refresh
                    this.setNode(node, index);
                } else {
                    // failed to create a new folder in the backend
                    this.selectedNode = null;
                    this._deleteNodeAtIndex(index);
                }
            } else {
                // update existing folder
                const folder = await this.view.domain.folders.update({
                    id: this.convertNodeIdToEntityId(node.id),
                    name: newText,
                });

                if (folder) {
                    node.text = newText;
                    this._toggleNodeAsReadOnly(node);
                    // force a refresh
                    this.setNode(node, index);
                }
            }
        }
        // entity
        else {
            // TODO
        }
    }

    private _cancelNodeTextEdit(node: FileNodeModel) {
        const index = this.getNodeIndex(node.id, false) as number;
        if (this.isPlaceholderNode(node)) this._deleteNodeAtIndex(index);
        else {
            if (node.data) {
                delete node.data.editableText;
                delete node.data.isEditable;
            }
            this.clearNodeError(node);
            this.setNode(node, index);
        }
    }

    private _endNodeTextEdit(node: FileNodeModel) {
        this.clearNodeError(node);
        if (this._editableTextField) this._editableTextField = null;
    }

    // NODE ERROR

    setNodeError(node: FileNodeModel, error: string) {
        this._addNodeData(node, { error });

        if (!this._editableTextField) {
            console.error(`Cannot edit node ${node.id} while it's read-only.`);
            return;
        }

        const element = this._editableTextField.current;

        const elementPos = element?.getBoundingClientRect();
        if (!elementPos) {
            console.error(
                `Unable to retrieve bounding rect of editable file node ${node.id}.`,
            );
            return;
        }

        const errorPos = {
            top: elementPos.bottom,
            bottom: elementPos.bottom + elementPos.height,
            left: elementPos.left - 1,
            right: elementPos.right + 1,
        };

        if (!this._editableTextField) this._editableTextField = createRef();
        this.errorManager.open(error, errorPos);
    }

    clearNodeError(node: FileNodeModel) {
        delete node?.data?.error;
        this.errorManager.close();
    }

    // OPEN NODE

    openEntityNode(id: Id) {
        const nodeId = convertEntryIdToNodeId(id);
        if (this.openedNode?.id == nodeId) return;
        const node = this._findNode(nodeId);
        if (node) this.openNode(node);
    }

    openNode(node: FileNodeModel) {
        this.openedNode = node;
    }

    // NODE GENERATION

    addNodeForCreatedEntity({ id, folder_id, title }: EntryInfoResponse) {
        const node = this._generateEntityNode(id, folder_id, title);
        this._nodes.push(node);
    }

    addPlaceholderNodeForNewFolder(): FileNodeModel {
        const id = this._placeholderIdGenerator.increment();
        const nodeId = `P${id}`;

        const node = this._generateFolderNode(nodeId, this.activeFolderId, "", {
            isPlaceholder: true,
        });
        this._toggleNodeAsEditable(node);

        return node;
    }

    _generateEntityNode(
        id: Id,
        folder_id: Id,
        title: string,
        data: FileNodeData | undefined = undefined,
    ): FileNodeModel {
        const node = {
            id: convertEntryIdToNodeId(id),
            parent: convertFolderIdToNodeId(folder_id),
            text: title,
        };
        if (data) this._addNodeData(node, data);
        return node;
    }

    _generateFolderNode(
        id: Id | string,
        parentId: Id,
        name: string,
        data: FileNodeData | undefined = undefined,
    ): FileNodeModel {
        const node = {
            id: convertFolderIdToNodeId(id),
            parent: convertFolderIdToNodeId(parentId),
            text: name,
            droppable: true,
        };
        if (data) this._addNodeData(node, data);
        return node;
    }

    _addNodeData(node: FileNodeModel, data: FileNodeData) {
        if (node.data) Object.assign(node.data, data);
        else node.data = data;
    }

    // NODE DELETION

    deleteEntityNode(id: Id) {
        this._deleteNode(convertEntryIdToNodeId(id));
    }

    deleteFolderNode(id: Id) {
        // child nodes should be deleted in separate calls
        this._deleteNode(convertFolderIdToNodeId(id));
    }

    deleteManyNodes(entryIds: Id[], folderIds: Id[]) {
        const entryNodeIds = new Set(
            entryIds.map((i) => convertEntryIdToNodeId(i)),
        );
        const folderNodeIds = new Set(
            folderIds.map((i) => convertFolderIdToNodeId(i)),
        );
        const nodeIds = entryNodeIds.union(folderNodeIds);

        this._nodes = this._nodes.filter((n) => !nodeIds.has(n.id));
        for (const nodeId of nodeIds) delete this._nodePositionCache[nodeId];
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

    // NODE MOVEMENT

    async moveNode(node: FileNodeModel, destFolderNodeId: NodeId) {
        let index = this.getNodeIndex(node.id);
        if (index === null) return false;

        const sourceFolderNodeId = node.parent;

        const id = this.convertNodeIdToEntityId(node.id);
        const sourceParentId = this.convertNodeIdToEntityId(sourceFolderNodeId);
        const destParentId = this.convertNodeIdToEntityId(destFolderNodeId);

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
                if (!replace) return false;

                const deleteResponse = await this.view.deleteFolder(
                    validateResponse.nameCollision.collidingFolderId,
                    false,
                );
                if (!deleteResponse) {
                    console.error(
                        "Failed to delete colliding folder. Aborting move.",
                    );
                    return false;
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
            // entity
            response = await this.view.domain.entries.updateFolder(
                id,
                destParentId,
                sourceParentId,
            );
        }

        if (!response) {
            console.error(
                `Unable to move node ${node.id} to folder ${destFolderNodeId}.`,
            );
            return false;
        }

        node.parent = destFolderNodeId;
        // setting the node at its current index forces a refresh of the tree component
        this.setNode(node, index);

        return true;
    }

    // HOOKS

    hookEditableNodeEffect() {
        const editableTextRef = this.editableTextField;
        useEffect(() => {
            if (editableTextRef?.current) {
                // focus the text field once it has been added to the DOM
                editableTextRef.current.focus();
            }
        }, [editableTextRef]);
    }
}

function convertEntryIdToNodeId(id: Id | string): NodeId {
    return `E${id}`;
}

function convertFolderIdToNodeId(id: Id | string): NodeId {
    if (id === ROOT_FOLDER_ID || id === ROOT_FOLDER_NODE_ID)
        return ROOT_FOLDER_NODE_ID;
    return `F${id}`;
}
