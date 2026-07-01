import { SvelteMap, SvelteSet } from "svelte/reactivity";

import type { IComponentService, OperationResult } from "@/interface";
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
    TreeServiceArgs,
    ValidateNodeTextEvent,
} from "./tree-interface";

export class TreeService<T> implements IComponentService {
    // CONFIG
    private _id: string;
    VALIDATION_WAIT_TIME = 0; // ms

    // STATE VARIABLES
    private _rootNodeId: string;
    private _structure: SvelteMap<string, string[]> = $state(new SvelteMap());
    private _nodes: Record<string, TreeNode<T>> = $state({});
    private _collapsedIds: SvelteSet<string> = $state(new SvelteSet());
    private _editableNodeIds: SvelteSet<string> = $state(new SvelteSet());
    selectedNodeId: string | null = $state(null);
    draggingNodeId: string | null = $state(null);
    dragOverBranchId: string | null = $state(null);

    // SERVICES
    private _validationDebouncer: ReplaceDebouncer<string, void>;
    private _commitDebouncer: BlockingDebouncer<string, void>;

    // EVENTS
    afterNodeMove: EventProducer<FinalizeNodeMoveEvent<T>, Promise<boolean>>;
    onCommitNodeTextEdit: EventProducer<
        TreeNode<T>,
        Promise<OperationResult<TreeNodeTextEdit<T>>>
    >;
    onValidateNodeText: EventProducer<
        ValidateNodeTextEvent<T>,
        Promise<OperationResult>
    >;
    onSelectLeafNode: EventProducer<TreeNode<T>, void>;
    onCloseContextMenu: (() => void) | null = null;

    constructor({ id, rootNodeId = "root" }: TreeServiceArgs) {
        this._id = id;
        this._rootNodeId = rootNodeId;

        this.afterNodeMove = new EventProducer();
        this.onCommitNodeTextEdit = new EventProducer();
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

    get rootNode(): TreeNode<T> {
        return {
            id: this._rootNodeId,
            parentId: "",
            text: "",
            isBranch: true,
            data: null as unknown as T,
        };
    }

    get selectedNode() {
        if (this.selectedNodeId !== null)
            return this.getNode(this.selectedNodeId) ?? null;
        return null;
    }

    get selectedBranchId() {
        const selectedNode = this.selectedNode;

        if (selectedNode) {
            return this.isBranchNode(selectedNode)
                ? selectedNode.id
                : selectedNode.parentId;
        }

        return this.rootNodeId;
    }

    // LOADING

    load(branches: TreeNodeInfo<T>[], leaves: TreeNodeInfo<T>[]) {
        this._nodes = {};
        this._structure.clear();

        for (const branch of branches) {
            const node: TreeNode<T> = {
                id: branch.id,
                parentId: branch.parentId,
                text: branch.text,
                isBranch: true,
                data: branch.data,
            };
            this._nodes[node.id] = node;
        }

        for (const leaf of leaves) {
            const node: TreeNode<T> = {
                id: leaf.id,
                parentId: leaf.parentId,
                text: leaf.text,
                isBranch: false,
                data: leaf.data,
            };
            this._nodes[node.id] = node;
        }

        const structure = new SvelteMap<string, TreeNode<T>[]>();
        for (const node of Object.values(this._nodes)) {
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
        this._nodes = {};
        this._collapsedIds.clear();
        this._editableNodeIds.clear();
        this.selectedNodeId = null;
    }

    // IDENTIFY NODE

    isBranchNode(node: TreeNode<T>): boolean {
        return node.isBranch;
    }

    isDescendantOfBranch(ancestorId: string, targetId: string): boolean {
        return this.getChildNodes(ancestorId).some(
            (c) =>
                c.id === targetId ||
                (c.isBranch && this.isDescendantOfBranch(c.id, targetId)),
        );
    }

    // RETRIEVE NODE

    getNode(nodeId: string): TreeNode<T> | undefined {
        return this._nodes[nodeId];
    }

    findNode(predicate: (node: TreeNode<T>) => boolean): TreeNode<T> | null {
        for (const node of Object.values(this._nodes)) {
            if (predicate(node)) return node;
        }

        return null;
    }

    getChildNodes(parentId: string): TreeNode<T>[] {
        return (this._structure.get(parentId) ?? [])
            .map((id) => this._nodes[id])
            .filter((n): n is TreeNode<T> => n !== undefined);
    }

    // SORT NODES

    sortChildrenOfNode(nodeId: string) {
        const children = this.getChildNodes(nodeId);
        const sortedChildren = this.sortNodes(children);
        this._structure.set(
            nodeId,
            sortedChildren.map((n) => n.id),
        );
    }

    sortNodes(nodes: TreeNode<T>[]): TreeNode<T>[] {
        return [...nodes].sort((a, b) => {
            if (a.isBranch && !b.isBranch) return -1;
            if (!a.isBranch && b.isBranch) return 1;
            return a.text.localeCompare(b.text);
        });
    }

    // COLLAPSE NODE

    isCollapsed(nodeId: string): boolean {
        return this._collapsedIds.has(nodeId);
    }

    toggleCollapsed(nodeId: string) {
        if (this._collapsedIds.has(nodeId)) this.expandNode(nodeId);
        else this.collapseNode(nodeId);
    }

    collapseNode(nodeId: string) {
        this._collapsedIds.add(nodeId);
    }

    expandNode(nodeId: string) {
        this._collapsedIds.delete(nodeId);
    }

    collapseAll() {
        const branchIds: string[] = [];
        for (const [id, node] of Object.entries(this._nodes)) {
            if (node.isBranch) branchIds.push(id);
        }
        this._collapsedIds = new SvelteSet(branchIds);
    }

    // SELECT NODE

    isNodeSelected(node: TreeNode<T>): boolean {
        return node.id === this.selectedNodeId;
    }

    selectNode(node: TreeNode<T>) {
        this.selectedNodeId = node.id;
        if (!this.isBranchNode(node)) this.onSelectLeafNode.produce(node);
    }

    // EDIT NODE

    isNodeEditable(nodeId: string): boolean {
        return this._editableNodeIds.has(nodeId);
    }

    makeNodeEditable(node: TreeNode<T>) {
        node.originalText = node.text;
        this._editableNodeIds.add(node.id);
    }

    private _makeNodeReadOnly(nodeId: string) {
        this._editableNodeIds.delete(nodeId);
        const node = this._nodes[nodeId];
        if (!node) return;
        node.isEditable = false;
    }

    setNodeEditText(nodeId: string, text: string) {
        const node = this._nodes[nodeId];
        if (!node) return;

        node.text = text;

        if (!this.onValidateNodeText.hasConsumer) return;

        console.debug(
            `Scheduling validation for node ${nodeId} with text "${text}"`,
        );
        this._validationDebouncer.call(nodeId).catch(() => undefined);
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
        const node = this._nodes[nodeId];
        if (!node) return;

        console.debug("Committing text edit for node", node);

        this._makeNodeReadOnly(nodeId);

        if (node.validationError) {
            delete node.validationError;
            this._revertNodeToOriginalText(node);
            return;
        }

        let result: OperationResult<TreeNodeTextEdit<T>>;

        if (this.onCommitNodeTextEdit.hasConsumer)
            result = await this.onCommitNodeTextEdit.produce(node);
        else
            result = {
                success: true,
                output: { ...node },
            };

        if (!result || !result.success || !result.output) {
            this._revertNodeToOriginalText(node);
            console.error(`Failed to commit text edit for node ${node.id}`);
            if (result && result.message) {
                console.error(`Reason: ${result.message}`);
            }
            return;
        }

        if (node.originalText !== result.output.text) {
            this.sortChildrenOfNode(node.parentId);
        }

        node.text = result.output.text;
        node.data = result.output.data;

        delete node.originalText;
    }

    private async _cancelNodeTextEdit(nodeId: string) {
        const node = this._nodes[nodeId];
        if (!node) return;

        console.debug("Cancelling text edit for node", node);

        this._makeNodeReadOnly(nodeId);

        delete node.validationError;
        this._revertNodeToOriginalText(node);
    }

    private _revertNodeToOriginalText(node: TreeNode<T>) {
        if (node.originalText === undefined)
            console.error(
                `Editable node ${node.id} does not have original text.`,
            );

        node.text = node.originalText ?? "";
        delete node.originalText;
    }

    // VALIDATE NODE TEXT

    getNodeError(nodeId: string) {
        const node = this._nodes[nodeId];
        const error = node?.validationError ?? null;
        console.debug(`Retrieving validation error for node ${nodeId}:`, error);
        return error;
    }

    private async _delayedValidateNodeText(
        nodeId: string,
    ): Promise<DebouncerResult<void>> {
        const result = await this._validateNodeText(nodeId);
        console.debug(`Validation result for node ${nodeId}:`, result);
        if (!result.success)
            return { status: "rejected", reason: result.message };
        return { status: "resolved", value: undefined };
    }

    private async _validateNodeText(nodeId: string): Promise<OperationResult> {
        const node = this._nodes[nodeId];
        if (!node) return { success: false, message: "Node not found" };

        if (!this.onValidateNodeText.hasConsumer) return { success: true };

        const currentText = node.text;
        const result = await this.onValidateNodeText.produce({
            node,
            text: currentText,
        });

        if (node.text !== currentText)
            return {
                success: false,
                message: "Text changed during validation",
            };

        if (result.success) {
            delete node.validationError;
            return { success: true };
        }

        console.debug(`Validation failed for node ${nodeId}:`, result.message);
        const error = result.message ?? "Node text is invalid.";
        node.validationError = error;

        return { success: false, message: error };
    }

    // ADD NODE

    addBranchNode({ id, parentId, text, data }: TreeNodeInfo<T>) {
        const node: TreeNode<T> = { id, parentId, text, isBranch: true, data };
        return this._addNode(parentId, node);
    }

    addLeafNode({ id, parentId, text, data }: TreeNodeInfo<T>) {
        const node: TreeNode<T> = { id, parentId, text, isBranch: false, data };
        return this._addNode(parentId, node);
    }

    private _addNode(parentId: string, node: TreeNode<T>) {
        node.parentId = parentId;

        this._nodes[node.id] = node;

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

    // REMOVE NODE

    removeNodeById(nodeId: string) {
        const node = this._nodes[nodeId];
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
        delete this._nodes[nodeId];
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

    // MOVE NODE

    isNodeDraggable(nodeId: string): boolean {
        return !this.isNodeEditable(nodeId);
    }

    async moveNode(nodeId: string, destBranchId: string) {
        this.dragOverBranchId = null;
        this.draggingNodeId = null;

        const movedNode = this.getNode(nodeId);
        if (!movedNode) return;

        if (
            movedNode.parentId === destBranchId ||
            movedNode.id === destBranchId ||
            this.isDescendantOfBranch(nodeId, destBranchId)
        )
            return;

        const moved = await this.afterNodeMove.produce({
            node: movedNode,
            destParentNodeId: destBranchId,
        });
        if (!moved) return;

        this._disconnectNode(movedNode);
        this._addNode(destBranchId, movedNode);
    }

    // EVENT HANDLERS

    handleDragStartById(e: DragEvent, nodeId: string) {
        if (!this.isNodeDraggable(nodeId)) {
            this.draggingNodeId = null;
            e.preventDefault();
            return;
        }

        this.draggingNodeId = nodeId;
        e.dataTransfer!.effectAllowed = "move";
        e.dataTransfer!.setData("text/plain", nodeId);
    }

    handleDragEnd() {
        this.draggingNodeId = null;
        this.dragOverBranchId = null;
    }

    handleNodeDragEnter(e: DragEvent, node: TreeNode<T>) {
        const branchId = this.isBranchNode(node) ? node.id : node.parentId;
        this.handleNodeDragEnterById(e, branchId);
    }

    handleNodeDragEnterById(e: DragEvent, branchId: string) {
        if (!this.draggingNodeId) return;
        e.preventDefault();
        this.dragOverBranchId = branchId;
    }

    handleNodeDragOver(e: DragEvent, node: TreeNode<T>) {
        const branchId = this.isBranchNode(node) ? node.id : node.parentId;
        this.handleNodeDragOverById(e, branchId);
    }

    handleNodeDragOverById(e: DragEvent, branchId: string) {
        if (!this.draggingNodeId) return;

        e.preventDefault();
        e.dataTransfer!.dropEffect = "move";

        this.dragOverBranchId = branchId;
    }

    handleNodeDragLeave(e: DragEvent, node: TreeNode<T>) {
        const branchId = this.isBranchNode(node) ? node.id : node.parentId;
        this.handleNodeDragLeaveById(e, branchId);
    }

    handleNodeDragLeaveById(e: DragEvent, branchId: string) {
        const related = e.relatedTarget as Node | null;
        const current = e.currentTarget as Element;
        if (related && current.contains(related)) return;

        if (this.dragOverBranchId === branchId) this.dragOverBranchId = null;
    }

    async handleNodeDrop(e: DragEvent, destNode: TreeNode<T>) {
        const branchId = this.isBranchNode(destNode)
            ? destNode.id
            : destNode.parentId;
        await this.handleNodeDropById(e, branchId);
    }

    async handleNodeDropById(e: DragEvent, destBranchId: string) {
        e.preventDefault();

        const movedNodeId =
            e.dataTransfer!.getData("text/plain") || this.draggingNodeId;
        if (!movedNodeId) return;

        await this.moveNode(movedNodeId, destBranchId);
    }

    async handleKeydown(e: KeyboardEvent, node: TreeNode<T>) {
        if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            this._cancelNodeTextEdit(node.id);
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
}
