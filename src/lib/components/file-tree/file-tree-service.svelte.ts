import { SvelteMap, SvelteSet } from "svelte/reactivity";

import type { IComponentService } from "@/interface";

import type {
    ConfirmNodeTextEditHandler,
    FinalizeMoveHandler,
    TreeNode,
    TreeNodeInfo,
} from "./file-tree-interface";

export interface FileTreeServiceArgs<T> {
    id: string;
    rootNodeId?: string;
    onFinalizeMove: FinalizeMoveHandler<T>;
    onConfirmNodeTextEdit: ConfirmNodeTextEditHandler<T>;
    onSelectLeaf: (node: TreeNode<T>) => void;
}

export class FileTreeService<T> implements IComponentService {
    // CONFIG
    private _id: string;

    // STATE VARIABLES
    private _rootNodeId: string;
    private _structure: SvelteMap<string, string[]> = $state(new SvelteMap());
    private _nodes: SvelteMap<string, TreeNode<T>> = $state(new SvelteMap());
    private _collapsedIds: SvelteSet<string> = $state(new SvelteSet());
    selectedNodeId: string | null = $state(null);
    draggingNodeId: string | null = $state(null);
    dragOverFolderId: string | null = $state(null);

    private _onMoveNode: FinalizeMoveHandler<T>;
    private _onConfirmNodeTextEdit: ConfirmNodeTextEditHandler<T>;
    private _onSelectLeaf: (node: TreeNode<T>) => void;

    constructor({
        id,
        rootNodeId = "root",
        onFinalizeMove,
        onConfirmNodeTextEdit,
        onSelectLeaf,
    }: FileTreeServiceArgs<T>) {
        this._id = id;
        this._rootNodeId = rootNodeId;
        this._onMoveNode = onFinalizeMove;
        this._onConfirmNodeTextEdit = onConfirmNodeTextEdit;
        this._onSelectLeaf = onSelectLeaf;
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

    isLeafSelected(node: TreeNode<T>): boolean {
        return node.id === this.selectedNodeId;
    }

    selectLeaf(node: TreeNode<T>) {
        this.selectedNodeId = node.id;
        this._onSelectLeaf(node);
    }

    // EDITING

    setNodeEditText(nodeId: string, text: string) {
        const node = this._nodes.get(nodeId);
        if (node) node.editableText = text;
    }

    async commitNodeTextEdit(node: TreeNode<T>) {
        const textEdit = await this._onConfirmNodeTextEdit(node);

        if (!textEdit) {
            this._removeNode(node);
            return;
        }

        node.text = textEdit.text;
        node.data = textEdit.data;
    }

    // TOPOLOGY

    addFolderNode({ id, parentId, text, data }: TreeNodeInfo<T>) {
        const node: TreeNode<T> = { id, parentId, text, isFolder: true, data };
        this._addNode(parentId, node);
    }

    addLeafNode({ id, parentId, text, data }: TreeNodeInfo<T>) {
        const node: TreeNode<T> = { id, parentId, text, isFolder: false, data };
        this._addNode(parentId, node);
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

        const moved = await this._onMoveNode(movedNode, destFolderId);
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
            this._removeNode(node);
        } else if (e.key === "Enter") {
            e.preventDefault();
            await this.commitNodeTextEdit(node);
        }
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
