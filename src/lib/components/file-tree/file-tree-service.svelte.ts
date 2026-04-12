import { SvelteMap, SvelteSet } from "svelte/reactivity";
import {
    SHADOW_ITEM_MARKER_PROPERTY_NAME,
    type DndEvent,
} from "svelte-dnd-action";

import type { IComponentService } from "@/interface";

import type { TreeNode } from "./file-tree-interface";

export interface FileTreeServiceArgs<T> {
    id: string;
    rootNodeId?: string;
    flipDurationMs?: number;
    onFinalize: (
        parentId: string,
        items: TreeNode<T>[],
        movedItemId: string,
    ) => Promise<void>;
    onConfirmEdit: (node: TreeNode<T>) => void;
    onSelectLeaf: (node: TreeNode<T>) => void;
}

export class FileTreeService<T> implements IComponentService {
    readonly id: string;
    readonly flipDurationMs: number;

    private _rootNodeId: string;
    private _childrenOf: SvelteMap<string, TreeNode<T>[]> = $state(
        new SvelteMap(),
    );
    private _collapsedIds: SvelteSet<string> = $state(new SvelteSet());
    selectedNodeId: string | null = $state(null);

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
        flipDurationMs = 200,
        onFinalize,
        onConfirmEdit,
        onSelectLeaf,
    }: FileTreeServiceArgs<T>) {
        this.id = id;
        this.flipDurationMs = flipDurationMs;
        this._rootNodeId = rootNodeId;
        this._onFinalize = onFinalize;
        this._onConfirmEdit = onConfirmEdit;
        this._onSelectLeaf = onSelectLeaf;
    }

    // TREE DATA

    childrenOf(parentId: string): TreeNode<T>[] {
        return this._childrenOf.get(parentId) ?? [];
    }

    setChildrenOf(parentId: string, items: TreeNode<T>[]) {
        this._childrenOf.set(parentId, items);
    }

    addNode(parentId: string, node: TreeNode<T>) {
        const current = this._childrenOf.get(parentId) ?? [];
        this._childrenOf.set(parentId, [...current, node]);
    }

    removeNode(nodeId: string) {
        for (const [parentId, children] of this._childrenOf) {
            const index = children.findIndex((n) => n.id === nodeId);
            if (index >= 0) {
                this._childrenOf.set(
                    parentId,
                    children.filter((n) => n.id !== nodeId),
                );
                return;
            }
        }
    }

    replaceNode(oldId: string, newNode: TreeNode<T>) {
        for (const [parentId, children] of this._childrenOf) {
            const index = children.findIndex((n) => n.id === oldId);
            if (index >= 0) {
                const updated = [...children];
                updated[index] = newNode;
                this._childrenOf.set(parentId, updated);
                return;
            }
        }
    }

    load(map: Map<string, TreeNode<T>[]>) {
        this._childrenOf = new SvelteMap(map);
    }

    clearTree() {
        this._childrenOf.clear();
        this._collapsedIds.clear();
        this.selectedNodeId = null;
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
        for (const [parentId] of this._childrenOf) {
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
        for (const [parentId, children] of this._childrenOf) {
            const node = children.find((n) => n.id === nodeId);
            if (node) {
                node.editableText = text;
                this._childrenOf.set(parentId, [...children]);
                return;
            }
        }
    }

    onConfirmEdit = (node: TreeNode<T>) => {
        this._onConfirmEdit(node);
    };

    // SHADOW ITEM

    shadowMarker = (node: TreeNode<T>) => {
        return (node as unknown as Record<string, unknown>)[
            SHADOW_ITEM_MARKER_PROPERTY_NAME
        ];
    };

    // EVENT HANDLERS

    handleConsider = (
        parentId: string,
        e: CustomEvent<DndEvent<TreeNode<T>>>,
    ) => {
        this.setChildrenOf(parentId, e.detail.items);
    };

    handleFinalize = async (
        parentId: string,
        e: CustomEvent<DndEvent<TreeNode<T>>>,
    ) => {
        const movedItemId = e.detail.info.id as string;
        this.setChildrenOf(parentId, e.detail.items);
        await this._onFinalize(parentId, e.detail.items, movedItemId);
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
