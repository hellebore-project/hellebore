import type { Snippet } from "svelte";

import type { TreeService } from "./tree-service.svelte";

export interface TreeServiceArgs {
    id: string;
    rootNodeId?: string;
}

export interface TreeNodeInfo<T> {
    id: string;
    parentId: string;
    text: string;
    data: T;
}

export interface TreeNode<T> extends TreeNodeInfo<T> {
    isBranch: boolean;
    isEditable?: boolean;
    originalText?: string;
    validationError?: string;
}

export interface TreeNodeTextEdit<T> {
    id: string;
    text: string;
    data: T;
}

export interface FinalizeNodeMoveEvent<T> {
    node: TreeNode<T>;
    destParentNodeId: string;
}

export interface ValidateNodeTextEvent<T> {
    node: TreeNode<T>;
    text: string;
}

export interface NodeTextValidationResult {
    valid: boolean;
    error?: string | null;
}

export interface EditableLabelProps<T> {
    service: TreeService<T>;
    node: TreeNode<T>;
}

export interface BranchNodeProps<T> {
    service: TreeService<T>;
    node: TreeNode<T>;
    depth: number;
    branchLabel?: Snippet<[TreeNode<T>, boolean]>;
    leafLabel?: Snippet<[TreeNode<T>]>;
    branchContextMenu?: Snippet<[TreeNode<T>]>;
    leafContextMenu?: Snippet<[TreeNode<T>]>;
}

export interface LeafNodeProps<T> {
    service: TreeService<T>;
    node: TreeNode<T>;
    depth: number;
    leafLabel?: Snippet<[TreeNode<T>]>;
    contextMenu?: Snippet<[TreeNode<T>]>;
}

export interface BranchProps<T> {
    service: TreeService<T>;
    node: TreeNode<T>;
    depth: number;
    branchLabel?: Snippet<[TreeNode<T>, boolean]>;
    leafLabel?: Snippet<[TreeNode<T>]>;
    branchContextMenu?: Snippet<[TreeNode<T>]>;
    leafContextMenu?: Snippet<[TreeNode<T>]>;
}

export interface TreeProps<T> {
    service: TreeService<T>;
    node: TreeNode<T>;
    branchLabel?: Snippet<[TreeNode<T>, boolean]>;
    leafLabel?: Snippet<[TreeNode<T>]>;
    branchContextMenu?: Snippet<[TreeNode<T>]>;
    leafContextMenu?: Snippet<[TreeNode<T>]>;
}
