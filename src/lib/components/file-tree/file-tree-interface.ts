import type { Snippet } from "svelte";

import type { FileTreeService } from "./file-tree-service.svelte";

export interface TreeNodeInfo<T> {
    id: string;
    parentId: string;
    text: string;
    data: T;
}

export interface TreeNode<T> extends TreeNodeInfo<T> {
    isFolder: boolean;
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

export interface EditableLabelProps<T> {
    service: FileTreeService<T>;
    node: TreeNode<T>;
}

export interface FolderNodeProps<T> {
    service: FileTreeService<T>;
    node: TreeNode<T>;
    depth: number;
    folderLabel?: Snippet<[TreeNode<T>, boolean]>;
    leafLabel?: Snippet<[TreeNode<T>]>;
    contextMenu?: Snippet<[TreeNode<T>]>;
}

export interface LeafNodeProps<T> {
    service: FileTreeService<T>;
    node: TreeNode<T>;
    depth: number;
    leafLabel?: Snippet<[TreeNode<T>]>;
    contextMenu?: Snippet<[TreeNode<T>]>;
}

export interface BranchProps<T> {
    service: FileTreeService<T>;
    node: TreeNode<T>;
    depth: number;
    folderLabel?: Snippet<[TreeNode<T>, boolean]>;
    leafLabel?: Snippet<[TreeNode<T>]>;
    nodeContextMenu?: Snippet<[TreeNode<T>]>;
}

export interface FileTreeProps<T> {
    service: FileTreeService<T>;
    node: TreeNode<T>;
    folderLabel?: Snippet<[TreeNode<T>, boolean]>;
    leafLabel?: Snippet<[TreeNode<T>]>;
    nodeContextMenu?: Snippet<[TreeNode<T>]>;
}
