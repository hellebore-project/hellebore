import { SvelteMap, SvelteSet } from "svelte/reactivity";

import type { IComponentService } from "@/interface";

import type { TreeNode } from "./file-tree-interface";

type FinalizeMoveHandler = (
    nodeId: string,
    destParentNodeId: string,
) => Promise<boolean>;

export interface FileTreeServiceArgs<T> {
    id: string;
    rootNodeId?: string;
    onFinalize: FinalizeMoveHandler;
    onConfirmEdit: (node: TreeNode<T>) => void;
    onSelectLeaf: (node: TreeNode<T>) => void;
}

export class FileTreeService<T> implements IComponentService {
    // CONFIG
    private _id: string;

    // STATE VARIABLES
    private _rootNodeId: string;
    private _nodes: SvelteMap<string, TreeNode<T>[]> = $state(new SvelteMap());
    private _collapsedIds: SvelteSet<string> = $state(new SvelteSet());
    selectedNodeId: string | null = $state(null);
    draggingNodeId: string | null = $state(null);
    dragOverFolderId: string | null = $state(null);

    private _onMoveNode: FinalizeMoveHandler;
    private _onConfirmEdit: (node: TreeNode<T>) => void;
    private _onSelectLeaf: (node: TreeNode<T>) => void;

    constructor({
        id,
        rootNodeId = "root",
        onFinalize,
        onConfirmEdit,
        onSelectLeaf,
    }: FileTreeServiceArgs<T>) {
        this._id = id;
        this._rootNodeId = rootNodeId;
        this._onMoveNode = onFinalize;
        this._onConfirmEdit = onConfirmEdit;
        this._onSelectLeaf = onSelectLeaf;
    }

    // PROPERTIES

    get id() {
        return this._id;
    }

    get rootNodeId() {
        return this._rootNodeId;
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
                : selectedNode.parent;
        }

        return this.rootNodeId;
    }

    // LOADING

    load(map: Map<string, TreeNode<T>[]>) {
        this._nodes = new SvelteMap(map);
    }

    // CLEAN UP

    clear() {
        this._nodes.clear();
        this._collapsedIds.clear();
        this.selectedNodeId = null;
    }

    // IDENTIFICATION

    isFolderNode(node: TreeNode<T>): boolean {
        return node.isFolder;
    }

    isDescendantOfFolder(ancestorId: string, targetId: string): boolean {
        return this.getChildren(ancestorId).some(
            (c) =>
                c.id === targetId ||
                (c.isFolder && this.isDescendantOfFolder(c.id, targetId)),
        );
    }

    // RETRIEVAL

    getNode(nodeId: string): TreeNode<T> | undefined {
        for (const children of this._nodes.values()) {
            const found = children.find((n) => n.id === nodeId);
            if (found) return found;
        }
        return undefined;
    }

    getChildren(parentId: string): TreeNode<T>[] {
        return this._nodes.get(parentId) ?? [];
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
        for (const [parentId] of this._nodes) {
            if (parentId !== this._rootNodeId) {
                folderIds.push(parentId);
            }
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

    setNode(oldId: string, newNode: TreeNode<T>) {
        for (const [parentId, children] of this._nodes) {
            const index = children.findIndex((n) => n.id === oldId);
            if (index >= 0) {
                const updated = [...children];
                updated[index] = newNode;
                this._nodes.set(parentId, updated);
                return;
            }
        }
    }

    setChildren(parentId: string, nodes: TreeNode<T>[]) {
        this._nodes.set(parentId, nodes);
    }

    setNodeEditText(nodeId: string, text: string) {
        for (const [parentId, children] of this._nodes) {
            const node = children.find((n) => n.id === nodeId);
            if (node) {
                node.editableText = text;
                this._nodes.set(parentId, [...children]);
                return;
            }
        }
    }

    onConfirmEdit = (node: TreeNode<T>) => {
        this._onConfirmEdit(node);
    };

    // ADDITION

    addNode(parentId: string, node: TreeNode<T>) {
        const current = this._nodes.get(parentId) ?? [];
        this._nodes.set(parentId, this.sortNodes([...current, node]));
    }

    // REMOVAL

    removeNode(nodeId: string) {
        for (const [parentId, children] of this._nodes) {
            const index = children.findIndex((n) => n.id === nodeId);
            if (index >= 0) {
                this._nodes.set(
                    parentId,
                    children.filter((n) => n.id !== nodeId),
                );
                return;
            }
        }
    }

    // RELOCATION

    async moveNode(nodeId: string, destFolderId: string) {
        this.dragOverFolderId = null;
        this.draggingNodeId = null;

        const movedNode = this.getNode(nodeId);
        if (!movedNode) return;

        if (
            movedNode.parent === destFolderId ||
            movedNode.id === destFolderId ||
            this.isDescendantOfFolder(nodeId, destFolderId)
        )
            return;

        const moved = await this._onMoveNode(nodeId, destFolderId);
        if (!moved) return;

        this.removeNode(nodeId);
        movedNode.parent = destFolderId;

        const newChildren = this.sortNodes([
            ...this.getChildren(destFolderId),
            movedNode,
        ]);
        this.setChildren(destFolderId, newChildren);
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
        const folderId = this.isFolderNode(node) ? node.id : node.parent;
        this.handleNodeDragEnterById(e, folderId);
    }

    handleNodeDragEnterById(e: DragEvent, folderId: string) {
        if (!this.draggingNodeId) return;
        e.preventDefault();
        this.dragOverFolderId = folderId;
    }

    handleNodeDragOver(e: DragEvent, node: TreeNode<T>) {
        const folderId = this.isFolderNode(node) ? node.id : node.parent;
        this.handleNodeDragOverById(e, folderId);
    }

    handleNodeDragOverById(e: DragEvent, folderId: string) {
        if (!this.draggingNodeId) return;

        e.preventDefault();
        e.dataTransfer!.dropEffect = "move";

        this.dragOverFolderId = folderId;
    }

    handleNodeDragLeave(e: DragEvent, node: TreeNode<T>) {
        const folderId = this.isFolderNode(node) ? node.id : node.parent;
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
            : destNode.parent;
        await this.handleNodeDropById(e, folderId);
    }

    async handleNodeDropById(e: DragEvent, destFolderId: string) {
        e.preventDefault();

        const movedNodeId =
            e.dataTransfer!.getData("text/plain") || this.draggingNodeId;
        if (!movedNodeId) return;

        this.moveNode(movedNodeId, destFolderId);
    }

    handleKeydown(e: KeyboardEvent, node: TreeNode<T>) {
        if (e.key === "Escape") {
            e.preventDefault();
            this.removeNode(node.id);
        } else if (e.key === "Enter") {
            e.preventDefault();
            this._onConfirmEdit(node);
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
