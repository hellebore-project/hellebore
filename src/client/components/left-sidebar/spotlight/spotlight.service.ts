import { TreeMethods } from "@minoru/react-dnd-treeview";
import { makeAutoObservable, toJS } from "mobx";
import { createRef, MouseEvent, RefObject, useEffect } from "react";

import { ROOT_FOLDER_ID, ROOT_FOLDER_NODE_ID } from "@/constants";
import {
    BulkFileResponse,
    DeleteFolderEvent,
    EntryInfoResponse,
    FolderResponse,
    FileNodeData,
    FileNodeModel,
    Hookable,
    IComponentService,
    Id,
    MoveFolderEvent,
    MoveFolderResult,
    NodeId,
    OpenEntryCreatorEvent,
    OpenEntryEditorEvent,
    OpenFileContextMenuEvent,
} from "@/interface";
import { OutsideEventHandlerService } from "@/components/outside-event-handler";
import { DomainManager } from "@/domain";
import { Counter } from "@/utils/counter";
import { EventProducer, MultiEventProducer } from "@/model";

import { FileNavigatorErrorManager } from "./file-navigator";

type PrivateKeys = "_nodePositionCache" | "_tree" | "_domain";

export interface SpotlightServiceArgs {
    domain: DomainManager;
}

// TODO: spin off the file tree logic into a separate FileNavigator class
export class SpotlightService implements IComponentService, Hookable {
    // CONSTANTS
    readonly key = "spotlight";
    readonly NODE_DOM_ID_PREFIX = "file-nav-node-";
    readonly NODE_TEXT_DOM_ID_PREFIX = "file-nav-node-text-";

    // STATE
    private _nodes: FileNodeModel[];
    private _nodePositionCache: Record<NodeId, number>;
    private _expanded = true;
    private _focused = false;
    private _hover = false;
    /** Node that this currently active; will be the target of user actions. */
    private _selectedNode: FileNodeModel | null = null;
    /** Node associated with the currently open file. */
    private _displayedNode: FileNodeModel | null = null;

    // REFERENCES
    /**
     * Reference to the file tree element.
     * Its handlers must be called inside a component function to ensure that the DOM is updated.
     */
    private _tree: RefObject<TreeMethods>;
    /**
     * Reference to the text field of the editable node, if it exists.
     * Must be observable so that the useEffect hook works.
     */
    editableTextRef: RefObject<HTMLInputElement> | null = null;

    // SERVICES
    _placeholderIdGenerator: Counter;
    outsideEvent: OutsideEventHandlerService;
    errorManager: FileNavigatorErrorManager;
    private _domain: DomainManager;

    // EVENTS
    fetchPortalSelector: EventProducer<void, string>;
    onCreateEntry: MultiEventProducer<OpenEntryCreatorEvent, unknown>;
    onOpenEntry: MultiEventProducer<OpenEntryEditorEvent, unknown>;
    onMoveFolder: EventProducer<MoveFolderEvent, Promise<MoveFolderResult>>;
    onDeleteFolder: MultiEventProducer<
        DeleteFolderEvent,
        Promise<BulkFileResponse | null>
    >;
    onOpenFolderContext: MultiEventProducer<OpenFileContextMenuEvent, unknown>;
    onOpenEntryContext: MultiEventProducer<OpenFileContextMenuEvent, unknown>;

    constructor({ domain }: SpotlightServiceArgs) {
        this._nodes = [];
        this._nodePositionCache = {};

        this._tree = createRef();

        this._placeholderIdGenerator = new Counter();
        this.outsideEvent = new OutsideEventHandlerService({
            key: "spotlight-outside-event-handler",
            enabled: true,
        });
        this.outsideEvent.onTrigger.subscribe(() => {
            this.focused = false;
            this.selectedNode = null;
        });
        this.errorManager = new FileNavigatorErrorManager();
        this._domain = domain;

        this.fetchPortalSelector = new EventProducer();
        this.onCreateEntry = new MultiEventProducer();
        this.onOpenEntry = new MultiEventProducer();
        this.onMoveFolder = new EventProducer();
        this.onDeleteFolder = new MultiEventProducer();
        this.onOpenFolderContext = new MultiEventProducer();
        this.onOpenEntryContext = new MultiEventProducer();

        makeAutoObservable<SpotlightService, PrivateKeys>(this, {
            _nodePositionCache: false,
            _placeholderIdGenerator: false,
            _tree: false,
            outsideEvent: false,
            errorManager: false,
            _domain: false,
            fetchPortalSelector: false,
            onCreateEntry: false,
            onOpenEntry: false,
            onMoveFolder: false,
            onDeleteFolder: false,
            onOpenFolderContext: false,
            onOpenEntryContext: false,
            hooks: false, // don't convert to a flow
        });
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

    get selectedFolderId() {
        if (this.selectedNode) {
            const id = this.isFolderNode(this.selectedNode)
                ? this.selectedNode.id
                : this.selectedNode.parent;
            return this.convertNodeIdToEntryId(id);
        }
        return ROOT_FOLDER_ID;
    }

    get displayedNode() {
        return this._displayedNode;
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

    // LOADING

    load(entries: EntryInfoResponse[], folders: FolderResponse[]) {
        this._nodePositionCache = {};

        const nodes: FileNodeModel[] = [];

        for (const entry of entries) {
            nodes.push(
                this._generateEntryNode(entry.id, entry.folderId, entry.title),
            );
        }
        for (const folder of folders) {
            nodes.push(
                this._generateFolderNode(
                    folder.id,
                    folder.parentId,
                    folder.name,
                ),
            );
        }

        this._nodes = nodes;
    }

    // CLEAN UP

    cleanUp() {
        this._nodes = [];
        this._nodePositionCache = {};
    }

    // ID CONVERSION

    convertNodeIdToEntryId(id: NodeId): number {
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

    // NODE TYPE

    isFolderNode(node: FileNodeModel) {
        return node.droppable;
    }

    isPlaceholderNode(node: FileNodeModel) {
        return node?.data?.isPlaceholder ?? false;
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

    getNodeIndex(nodeId: NodeId | null, cache = true): number | null {
        if (!nodeId) return null;

        let index = this._nodePositionCache[nodeId];
        const node = this._nodes[index];

        if (node && node.id == nodeId) return index;

        index = 0;
        for (const node of this._nodes) {
            if (node.id != nodeId) {
                index++;
                continue;
            }
            if (cache) this._nodePositionCache[nodeId] = index;
            return index;
        }

        return null;
    }

    _findNode(nodeId: NodeId | null, cache = true): FileNodeModel | null {
        if (!nodeId) return null;

        let index = this._nodePositionCache[nodeId];
        const node = this._nodes[index];

        if (node && node.id == nodeId) return node;

        index = 0;
        for (const node of this._nodes) {
            if (node.id != nodeId) {
                index++;
                continue;
            }
            if (cache) this._nodePositionCache[nodeId] = index;
            return node;
        }

        return null;
    }

    // NODE SELECTION

    selectNode(node: FileNodeModel, toggleNode: () => void) {
        this.focused = true;
        this.selectedNode = node;

        // if the node is editable, then its open status must remain static
        const editable = node?.data?.isEditable ?? false;
        if (editable) return;

        toggleNode();

        this.displayNode(node);
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
        text = "",
    ) {
        this._addNodeData(node, { isEditable: true, editableText: text });

        this.editableTextRef = createRef();

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
            const id = this.isPlaceholderNode(node)
                ? null
                : this.convertNodeIdToEntryId(node.id);

            // validate the new text
            if (this.isFolderNode(node)) {
                const parentId = this.convertNodeIdToEntryId(node.parent);
                const validationResponse = await this._domain.folders.validate(
                    id,
                    parentId,
                    newText,
                );

                if (!validationResponse)
                    this.setNodeError(
                        node,
                        `Failed to validate new location of folder ${id}.`,
                    );
                else if (validationResponse.nameCollision)
                    this.setNodeError(
                        node,
                        `A folder named ${newText} already exists at this location.`,
                    );
                else this.clearNodeError(node);
            } else {
                // entry
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
                const parentId = this.convertNodeIdToEntryId(node.parent);
                const folder = await this._domain.folders.create(
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
                    this._deleteNode(node, index);
                }
            } else {
                // update existing folder
                const folder = await this._domain.folders.update({
                    id: this.convertNodeIdToEntryId(node.id),
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
        // entry
        else {
            // TODO
        }
    }

    private _cancelNodeTextEdit(node: FileNodeModel) {
        const index = this.getNodeIndex(node.id, false) as number;
        if (this.isPlaceholderNode(node)) this._deleteNode(node, index);
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
        if (this.editableTextRef) this.editableTextRef = null;
    }

    // NODE ERROR

    setNodeError(node: FileNodeModel, error: string) {
        this._addNodeData(node, { error });

        if (!this.editableTextRef) {
            console.error(`Cannot edit node ${node.id} while it's read-only.`);
            return;
        }

        const element = this.editableTextRef.current;

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

        if (!this.editableTextRef) this.editableTextRef = createRef();
        this.errorManager.open(error, errorPos);
    }

    clearNodeError(node: FileNodeModel) {
        delete node?.data?.error;
        this.errorManager.close();
    }

    // OPEN NODE

    setEntryNodeDisplayedStatus(id: Id, displayed: boolean) {
        const nodeId = convertEntryIdToNodeId(id);
        if (this._displayedNode?.id == nodeId) return;

        const node = this._findNode(nodeId);
        if (node) this._setNodeDisplayedStatus(node, displayed);
    }

    private _setNodeDisplayedStatus(node: FileNodeModel, displayed: boolean) {
        if (displayed) this._displayedNode = node;
        else if (this._displayedNode && this._displayedNode.id === node.id)
            this._displayedNode = null;
    }

    displayNode(node: FileNodeModel) {
        if (this.isFolderNode(node)) return;
        const id = this.convertNodeIdToEntryId(node.id);
        this.onOpenEntry.produce({ id });
    }

    // NODE GENERATION

    addNodeForCreatedEntry({ id, folderId, title }: EntryInfoResponse) {
        const node = this._generateEntryNode(id, folderId, title);
        this._nodes.push(node);
    }

    addPlaceholderNodeForNewFolder(): FileNodeModel {
        const id = this._placeholderIdGenerator.increment();
        const nodeId = `P${id}`;

        const node = this._generateFolderNode(
            nodeId,
            this.selectedFolderId,
            "",
            {
                isPlaceholder: true,
            },
        );
        this._toggleNodeAsEditable(node);

        return node;
    }

    _generateEntryNode(
        id: Id,
        folderId: Id,
        title: string,
        data: FileNodeData | undefined = undefined,
    ): FileNodeModel {
        const node = {
            id: convertEntryIdToNodeId(id),
            parent: convertFolderIdToNodeId(folderId),
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
        this._deleteNodeById(convertEntryIdToNodeId(id));
    }

    deleteFolderNode(id: Id) {
        // child nodes should be deleted in separate calls
        this._deleteNodeById(convertFolderIdToNodeId(id));
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

    _deleteNodeById(nodeId: NodeId) {
        const index = this.getNodeIndex(nodeId, false);
        if (index === null) return;

        const node = this._nodes[index];
        this._deleteNode(node, index);

        return node;
    }

    _deleteNodeAtIndex(index: number) {
        const node = this._nodes[index];
        this._deleteNode(node, index);
        return node;
    }

    _deleteNode(node: FileNodeModel, index: number) {
        if (this._selectedNode?.id === node.id) this._selectedNode = null;
        if (this._displayedNode?.id === node.id) this._displayedNode = null;

        this._nodes.splice(index, 1);
        delete this._nodePositionCache[node.id];
    }

    // NODE MOVEMENT

    async moveNode(
        node: FileNodeModel,
        destFolderNodeId: NodeId,
    ): Promise<boolean> {
        const sourceFolderNodeId = node.parent;

        const id = this.convertNodeIdToEntryId(node.id);
        const sourceParentId = this.convertNodeIdToEntryId(sourceFolderNodeId);
        const destParentId = this.convertNodeIdToEntryId(destFolderNodeId);

        let moved: boolean;
        let cancelled = false;
        if (this.isFolderNode(node)) {
            const response = await this.onMoveFolder.produce({
                id,
                title: node.text,
                sourceParentId,
                destParentId,
            });
            moved = response.moved;
            cancelled = response.cancelled;
        } else {
            const response = await this._domain.entries.update({
                id,
                folderId: destParentId,
            });
            if (response) moved = response.folderId.updated;
            else moved = false;
        }

        if (!moved && !cancelled)
            console.error(
                `Unable to move node ${node.id} to folder ${destFolderNodeId}.`,
            );
        if (!moved) return false;

        node.parent = destFolderNodeId;

        // setting the node at its current index forces a refresh of the tree component
        // TODO: there has to be a way to avoid this
        const index = this.getNodeIndex(node.id);
        if (index === null) return false;
        this.setNode(node, index);

        return true;
    }

    // NODE COLLAPSING

    collapseNodes() {
        this.tree?.current?.closeAll();
    }

    // HEADER BUTTONS

    onClickAddEntryButton() {
        this.onCreateEntry.produce({
            folderId: this.selectedFolderId,
        });
    }

    onClickAddFolderButton() {
        const node = this.addPlaceholderNodeForNewFolder();
        // the parent folder needs to be open
        this.tree?.current?.open(node.parent);
    }

    // CONTEXT MENU

    openContextMenu(event: MouseEvent<HTMLDivElement>) {
        event.preventDefault();

        const elementId = event.currentTarget.id;
        if (!elementId) return;

        const nodeId = this.convertDOMIdToNodeId(elementId);
        const node = this.getNode(nodeId);
        if (!node) return;

        this.focused = false;
        this.selectedNode = node;
        const id = this.convertNodeIdToEntryId(nodeId);

        if (this.isFolderNode(node))
            this.onOpenFolderContext.produce({
                id,
                text: node.text,
                position: { x: event.pageX, y: event.pageY },
            });
        else
            this.onOpenEntryContext.produce({
                id,
                text: node.text,
                position: { x: event.pageX, y: event.pageY },
            });
    }

    // HOOKS

    *hooks() {
        yield {
            name: "FOCUS_EDITABLE_TEXT",
            componentKey: this.key,
            call: this._focusEditableTextOnRender.bind(this),
        };
        yield* this.outsideEvent.hooks();
    }

    _focusEditableTextOnRender() {
        const ref = this.editableTextRef;
        useEffect(() => {
            if (ref?.current) {
                // focus the text field once it has been added to the DOM
                ref.current.focus();
            }
        }, [ref]);
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
