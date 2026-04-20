import { SvelteMap, SvelteSet } from "svelte/reactivity";

import type { IComponentService } from "@/interface";
import {
    BlockingDebouncer,
    ReplaceDebouncer,
    type DebouncerResult,
} from "@/utils/debouncer";
import { EventProducer } from "@/utils/event-producer";

import type {
    FinalizeNodeMoveEvent,
    TreeNode,
    TreeNodeInfo,
    TreeNodeTextEdit,
    ValidateNodeTextEvent,
} from "./file-tree-interface";

export interface FileTreeServiceArgs {
    id: string;
    rootNodeId?: string;
}

interface NodeTextValidationResult {
    valid: boolean;
    error?: string | null;
}

export class FileTreeService<T> implements IComponentService {
    // CONFIG
    private _id: string;
    VALIDATION_WAIT_TIME = 300; // ms

    // STATE VARIABLES
    private _rootNodeId: string;
    private _structure: SvelteMap<string, string[]> = $state(new SvelteMap());
    private _nodes: SvelteMap<string, TreeNode<T>> = $state(new SvelteMap());
    private _collapsedIds: SvelteSet<string> = $state(new SvelteSet());
    private _editableNodeIds: SvelteSet<string> = $state(new SvelteSet());
    selectedNodeId: string | null = $state(null);
    draggingNodeId: string | null = $state(null);
    dragOverFolderId: string | null = $state(null);

    // SERVICES
    private _validationDebouncer: ReplaceDebouncer<string, void>;
    private _commitDebouncer: BlockingDebouncer<string, void>;

    // EVENTS
    onFinalizeNodeMove: EventProducer<
        FinalizeNodeMoveEvent<T>,
        Promise<boolean>
    >;
    onFinalizeNodeTextEdit: EventProducer<
        TreeNode<T>,
        Promise<TreeNodeTextEdit<T> | null>
    >;
    onValidateNodeText: EventProducer<
        ValidateNodeTextEvent<T>,
        Promise<string | null>
    >;
    onSelectLeafNode: EventProducer<TreeNode<T>, void>;
    onCloseContextMenu: (() => void) | null = null;

    constructor({ id, rootNodeId = "root" }: FileTreeServiceArgs) {
        this._id = id;
        this._rootNodeId = rootNodeId;

        this.onFinalizeNodeMove = new EventProducer();
        this.onFinalizeNodeTextEdit = new EventProducer();
        this.onValidateNodeText = new EventProducer();
        this.onSelectLeafNode = new EventProducer();

        this._validationDebouncer = new ReplaceDebouncer(
            this._delayedValidateNodeText.bind(this),
            this.VALIDATION_WAIT_TIME,
        );
        this._commitDebouncer = new BlockingDebouncer(
            this._delayedCommitNodeTextEdit.bind(this),
        );
    }

    // PROPERTIES

    get id() {
        return this._id;
    }

    get rootNodeId() {
        return this._rootNodeId;
    }

    get rootNode() {
        return {
            id: this._rootNodeId,
            parentId: "",
            text: "",
            isFolder: true,
            data: null as unknown as T,
        };
    }

    get selectedNode() {
        if (this.selectedNodeId !== null)
            return this.getNode(this.selectedNodeId) ?? null;
        return null;
    }

    get selectedFolderId() {
        const selectedNode = this.selectedNode;

        if (selectedNode) {
            return this.isFolderNode(selectedNode)
                ? selectedNode.id
                : selectedNode.parentId;
        }

        return this.rootNodeId;
    }

    // LOADING

    load(folders: TreeNodeInfo<T>[], leaves: TreeNodeInfo<T>[]) {
        this._nodes.clear();
        this._structure.clear();

        for (const folder of folders) {
            const node: TreeNode<T> = {
                id: folder.id,
                parentId: folder.parentId,
                text: folder.text,
                isFolder: true,
                data: folder.data,
            };
            this._nodes.set(node.id, node);
        }

        for (const leaf of leaves) {
            const node: TreeNode<T> = {
                id: leaf.id,
                parentId: leaf.parentId,
                text: leaf.text,
                isFolder: false,
                data: leaf.data,
            };
            this._nodes.set(node.id, node);
        }

        const structure = new SvelteMap<string, TreeNode<T>[]>();
        for (const node of this._nodes.values()) {
            const parentId = node.parentId || this.rootNodeId;
            if (structure.has(parentId)) structure.get(parentId)!.push(node);
            else structure.set(parentId, [node]);
        }

        for (const parentId of structure.keys()) {
            const children = structure.get(parentId)!;
            const sortedChildren = this.sortNodes(children);
            this._structure.set(
                parentId,
                sortedChildren.map((n) => n.id),
            );
        }
    }

    // CLEAN UP

    clear() {
        this._structure.clear();
        this._nodes.clear();
        this._collapsedIds.clear();
        this._editableNodeIds.clear();
        this.selectedNodeId = null;
    }

    // IDENTIFICATION

    isFolderNode(node: TreeNode<T>): boolean {
        return node.isFolder;
    }

    isDescendantOfFolder(ancestorId: string, targetId: string): boolean {
        return this.getChildNodes(ancestorId).some(
            (c) =>
                c.id === targetId ||
                (c.isFolder && this.isDescendantOfFolder(c.id, targetId)),
        );
    }

    // RETRIEVAL

    getNode(nodeId: string): TreeNode<T> | undefined {
        return this._nodes.get(nodeId);
    }

    getChildNodes(parentId: string): TreeNode<T>[] {
        return (this._structure.get(parentId) ?? [])
            .map((id) => this._nodes.get(id))
            .filter((n): n is TreeNode<T> => n !== undefined);
    }

    // COLLAPSE

    isCollapsed(nodeId: string): boolean {
        return this._collapsedIds.has(nodeId);
    }

    toggleCollapsed(nodeId: string) {
        if (this._collapsedIds.has(nodeId)) {
            this._collapsedIds.delete(nodeId);
        } else {
            this._collapsedIds.add(nodeId);
        }
    }

    collapseAll() {
        const folderIds: string[] = [];
        for (const [id, node] of this._nodes) {
            if (node.isFolder) folderIds.push(id);
        }
        this._collapsedIds = new SvelteSet(folderIds);
    }

    // SELECTION

    isNodeSelected(node: TreeNode<T>): boolean {
        return node.id === this.selectedNodeId;
    }

    selectNode(node: TreeNode<T>) {
        this.selectedNodeId = node.id;
        if (!this.isFolderNode(node)) this.onSelectLeafNode.produce(node);
    }

    // EDITING

    isNodeEditable(nodeId: string): boolean {
        return this._editableNodeIds.has(nodeId);
    }

    makeNodeEditable(node: TreeNode<T>) {
        node.originalText = node.text;
        this._editableNodeIds.add(node.id);
    }

    private _makeNodeReadOnly(nodeId: string) {
        this._editableNodeIds.delete(nodeId);
        const node = this._nodes.get(nodeId);
        if (!node) return;
        node.isEditable = false;
    }

    setNodeEditText(nodeId: string, text: string) {
        const node = this._nodes.get(nodeId);
        if (!node) return;

        node.text = text;

        if (!this.onValidateNodeText.hasConsumer) return;

        console.debug(
            `Scheduling validation for node ${nodeId} with text "${text}"`,
        );
        this._validationDebouncer.call(nodeId);
    }

    private async _delayedValidateNodeText(
        nodeId: string,
    ): Promise<DebouncerResult<void>> {
        const result = await this._validateNodeText(nodeId);
        console.debug(`Validation result for node ${nodeId}:`, result);
        if (!result.valid) return { status: "rejected", reason: result.error };
        return { status: "resolved", value: undefined };
    }

    private async _validateNodeText(
        nodeId: string,
    ): Promise<NodeTextValidationResult> {
        const node = this._nodes.get(nodeId);
        if (!node) return { valid: false, error: "Node not found" };

        const currentText = node.text;
        const error = await this.onValidateNodeText.produce({
            node,
            text: currentText,
        });

        if (node.text !== currentText)
            return { valid: false, error: "Text changed during validation" };

        node.validationError = error ?? undefined;

        if (error) return { valid: false, error };

        return { valid: true };
    }

    async commitNodeTextEdit(nodeId: string) {
        await this._commitDebouncer.call(nodeId);
    }

    private async _delayedCommitNodeTextEdit(
        nodeId: string,
    ): Promise<DebouncerResult<void>> {
        if (this._validationDebouncer.pending) {
            console.debug(
                `Waiting for validation to complete before committing text edit for node ${nodeId}`,
            );
            await this._validationDebouncer.pending.then(async () => {
                console.debug(
                    `Validation completed, committing text edit for node ${nodeId}`,
                );
                await this._commitNodeTextEdit(nodeId);
            });
        } else {
            await this._commitNodeTextEdit(nodeId);
        }
        return { status: "resolved", value: undefined };
    }

    private async _commitNodeTextEdit(nodeId: string) {
        const node = this._nodes.get(nodeId);
        if (!node) return;

        console.debug("Committing text edit for node", node);

        this._makeNodeReadOnly(nodeId);

        if (node.validationError) {
            delete node.validationError;
            this._revertNodeToOriginalText(node);
            return;
        }

        const textEdit = await this.onFinalizeNodeTextEdit.produce(node);

        if (!textEdit) {
            this._revertNodeToOriginalText(node);
            return;
        }

        node.text = textEdit.text;
        node.data = textEdit.data;
    }

    private _revertNodeToOriginalText(node: TreeNode<T>) {
        if (node.originalText === undefined)
            console.error(
                `Editable node ${node.id} does not have original text.`,
            );

        node.text = node.originalText ?? "";
    }

    // TOPOLOGY

    addFolderNode({ id, parentId, text, data }: TreeNodeInfo<T>) {
        const node: TreeNode<T> = { id, parentId, text, isFolder: true, data };
        return this._addNode(parentId, node);
    }

    addLeafNode({ id, parentId, text, data }: TreeNodeInfo<T>) {
        const node: TreeNode<T> = { id, parentId, text, isFolder: false, data };
        return this._addNode(parentId, node);
    }

    private _addNode(parentId: string, node: TreeNode<T>) {
        node.parentId = parentId;

        this._nodes.set(node.id, node);

        const children = this.sortNodes([
            ...this.getChildNodes(parentId),
            node,
        ]);
        this._structure.set(
            parentId,
            children.map((n) => n.id),
        );

        return node;
    }

    removeNodeById(nodeId: string) {
        const node = this._nodes.get(nodeId);
        if (!node) return;
        this._removeNode(node);
    }

    private _removeNode(node: TreeNode<T>) {
        this._removeNodeById(node.id);
    }

    private _removeNodeById(nodeId: string) {
        for (const childId of this._structure.get(nodeId) ?? [])
            this._removeNodeById(childId);
        this._structure.delete(nodeId);
        this._nodes.delete(nodeId);
    }

    private _disconnectNode(node: TreeNode<T>) {
        const siblings = this._structure.get(node.parentId);
        if (siblings)
            this._structure.set(
                node.parentId,
                siblings.filter((id) => id !== node.id),
            );

        node.parentId = "";
    }

    async moveNode(nodeId: string, destFolderId: string) {
        this.dragOverFolderId = null;
        this.draggingNodeId = null;

        const movedNode = this.getNode(nodeId);
        if (!movedNode) return;

        if (
            movedNode.parentId === destFolderId ||
            movedNode.id === destFolderId ||
            this.isDescendantOfFolder(nodeId, destFolderId)
        )
            return;

        const moved = await this.onFinalizeNodeMove.produce({
            node: movedNode,
            destParentNodeId: destFolderId,
        });
        if (!moved) return;

        this._disconnectNode(movedNode);
        this._addNode(destFolderId, movedNode);
    }

    // EVENT HANDLERS

    handleDragStartById(e: DragEvent, nodeId: string) {
        this.draggingNodeId = nodeId;
        e.dataTransfer!.effectAllowed = "move";
        e.dataTransfer!.setData("text/plain", nodeId);
    }

    handleDragEnd() {
        this.draggingNodeId = null;
        this.dragOverFolderId = null;
    }

    handleNodeDragEnter(e: DragEvent, node: TreeNode<T>) {
        const folderId = this.isFolderNode(node) ? node.id : node.parentId;
        this.handleNodeDragEnterById(e, folderId);
    }

    handleNodeDragEnterById(e: DragEvent, folderId: string) {
        if (!this.draggingNodeId) return;
        e.preventDefault();
        this.dragOverFolderId = folderId;
    }

    handleNodeDragOver(e: DragEvent, node: TreeNode<T>) {
        const folderId = this.isFolderNode(node) ? node.id : node.parentId;
        this.handleNodeDragOverById(e, folderId);
    }

    handleNodeDragOverById(e: DragEvent, folderId: string) {
        if (!this.draggingNodeId) return;

        e.preventDefault();
        e.dataTransfer!.dropEffect = "move";

        this.dragOverFolderId = folderId;
    }

    handleNodeDragLeave(e: DragEvent, node: TreeNode<T>) {
        const folderId = this.isFolderNode(node) ? node.id : node.parentId;
        this.handleNodeDragLeaveById(e, folderId);
    }

    handleNodeDragLeaveById(e: DragEvent, folderId: string) {
        const related = e.relatedTarget as Node | null;
        const current = e.currentTarget as Element;
        if (related && current.contains(related)) return;

        if (this.dragOverFolderId === folderId) this.dragOverFolderId = null;
    }

    async handleNodeDrop(e: DragEvent, destNode: TreeNode<T>) {
        const folderId = this.isFolderNode(destNode)
            ? destNode.id
            : destNode.parentId;
        await this.handleNodeDropById(e, folderId);
    }

    async handleNodeDropById(e: DragEvent, destFolderId: string) {
        e.preventDefault();

        const movedNodeId =
            e.dataTransfer!.getData("text/plain") || this.draggingNodeId;
        if (!movedNodeId) return;

        await this.moveNode(movedNodeId, destFolderId);
    }

    async handleKeydown(e: KeyboardEvent, node: TreeNode<T>) {
        if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            this._revertNodeToOriginalText(node);
        } else if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            await this.commitNodeTextEdit(node.id);
        }
    }

    handleContextMenuStatusChange(open: boolean) {
        if (open) return;
        const handler = this.onCloseContextMenu;
        this.onCloseContextMenu = null;
        handler?.();
    }

    // UTILITY

    sortNodes(nodes: TreeNode<T>[]): TreeNode<T>[] {
        return [...nodes].sort((a, b) => {
            if (a.isFolder && !b.isFolder) return -1;
            if (!a.isFolder && b.isFolder) return 1;
            return a.text.localeCompare(b.text);
        });
    }
}
