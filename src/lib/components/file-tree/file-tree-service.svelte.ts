import { SvelteMap, SvelteSet } from "svelte/reactivity";

import type { IComponentService } from "@/interface";

import type { TreeNode } from "./file-tree-interface";

export interface FileTreeServiceArgs<T> {
    id: string;
    rootNodeId?: string;
    onFinalize: (
        parentId: string,
        items: TreeNode<T>[],
        movedItemId: string,
    ) => Promise<void>;
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

    private _onFinalize: (
        parentId: string,
        items: TreeNode<T>[],
        movedItemId: string,
    ) => Promise<void>;
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
        this._onFinalize = onFinalize;
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

    // NODES

    private _findNode(nodeId: string): TreeNode<T> | undefined {
        for (const children of this._nodes.values()) {
            const found = children.find((n) => n.id === nodeId);
            if (found) return found;
        }
        return undefined;
    }

    private _isDescendantFolder(ancestorId: string, targetId: string): boolean {
        return this.getChildren(ancestorId).some(
            (c) =>
                c.id === targetId ||
                (c.isFolder && this._isDescendantFolder(c.id, targetId)),
        );
    }

    getChildren(parentId: string): TreeNode<T>[] {
        return this._nodes.get(parentId) ?? [];
    }

    setChildren(parentId: string, nodes: TreeNode<T>[]) {
        this._nodes.set(parentId, nodes);
    }

    addNode(parentId: string, node: TreeNode<T>) {
        const current = this._nodes.get(parentId) ?? [];
        this._nodes.set(parentId, this.sortNodes([...current, node]));
    }

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

    replaceNode(oldId: string, newNode: TreeNode<T>) {
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

    sortNodes(nodes: TreeNode<T>[]): TreeNode<T>[] {
        return [...nodes].sort((a, b) => {
            if (a.isFolder && !b.isFolder) return -1;
            if (!a.isFolder && b.isFolder) return 1;
            return a.text.localeCompare(b.text);
        });
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

    // EVENT HANDLERS

    handleDragStart = (e: DragEvent, nodeId: string) => {
        this.draggingNodeId = nodeId;
        e.dataTransfer!.effectAllowed = "move";
        e.dataTransfer!.setData("text/plain", nodeId);
    };

    handleDragEnd = () => {
        this.draggingNodeId = null;
        this.dragOverFolderId = null;
    };

    handleDragEnter = (e: DragEvent, folderId: string) => {
        if (!this.draggingNodeId) return;
        e.preventDefault();
        this.dragOverFolderId = folderId;
    };

    handleDragOver = (e: DragEvent, folderId: string) => {
        if (!this.draggingNodeId) return;
        e.preventDefault();
        e.dataTransfer!.dropEffect = "move";
        this.dragOverFolderId = folderId;
    };

    handleDragLeave = (e: DragEvent, folderId: string) => {
        const related = e.relatedTarget as Node | null;
        const current = e.currentTarget as Element;
        if (related && current.contains(related)) return;
        if (this.dragOverFolderId === folderId) {
            this.dragOverFolderId = null;
        }
    };

    handleDrop = async (e: DragEvent, folderId: string) => {
        e.preventDefault();
        const nodeId =
            e.dataTransfer!.getData("text/plain") || this.draggingNodeId;
        this.dragOverFolderId = null;
        this.draggingNodeId = null;

        if (!nodeId) return;

        const movedNode = this._findNode(nodeId);
        if (!movedNode) return;

        if (
            movedNode.parent === folderId ||
            movedNode.id === folderId ||
            this._isDescendantFolder(nodeId, folderId)
        ) {
            return;
        }

        this.removeNode(nodeId);
        movedNode.parent = folderId;
        const newChildren = this.sortNodes([
            ...this.getChildren(folderId),
            movedNode,
        ]);
        this.setChildren(folderId, newChildren);
        await this._onFinalize(folderId, newChildren, nodeId);
    };

    handleNodeDragEnter = (e: DragEvent, node: TreeNode<T>) => {
        if (!this.draggingNodeId) return;
        e.preventDefault();
        this.dragOverFolderId = node.isFolder ? node.id : node.parent;
    };

    handleNodeDragOver = (e: DragEvent, node: TreeNode<T>) => {
        if (!this.draggingNodeId) return;
        e.preventDefault();
        e.dataTransfer!.dropEffect = "move";
        this.dragOverFolderId = node.isFolder ? node.id : node.parent;
    };

    handleNodeDragLeave = (e: DragEvent, node: TreeNode<T>) => {
        const related = e.relatedTarget as Node | null;
        const current = e.currentTarget as Element;
        if (related && current.contains(related)) return;
        const effectiveFolderId = node.isFolder ? node.id : node.parent;
        if (this.dragOverFolderId === effectiveFolderId) {
            this.dragOverFolderId = null;
        }
    };

    handleNodeDrop = async (e: DragEvent, node: TreeNode<T>) => {
        e.preventDefault();
        const nodeId =
            e.dataTransfer!.getData("text/plain") || this.draggingNodeId;
        this.dragOverFolderId = null;
        this.draggingNodeId = null;

        if (!nodeId) return;

        const movedNode = this._findNode(nodeId);
        if (!movedNode) return;

        const targetParentId = node.isFolder ? node.id : node.parent;

        if (
            movedNode.parent === targetParentId ||
            movedNode.id === targetParentId ||
            this._isDescendantFolder(nodeId, targetParentId)
        ) {
            return;
        }

        this.removeNode(nodeId);
        movedNode.parent = targetParentId;
        const newChildren = this.sortNodes([
            ...this.getChildren(targetParentId),
            movedNode,
        ]);
        this.setChildren(targetParentId, newChildren);
        await this._onFinalize(targetParentId, newChildren, nodeId);
    };

    handleKeydown = (e: KeyboardEvent, node: TreeNode<T>) => {
        if (e.key === "Escape") {
            e.preventDefault();
            this.removeNode(node.id);
        } else if (e.key === "Enter") {
            e.preventDefault();
            this._onConfirmEdit(node);
        }
    };
}
