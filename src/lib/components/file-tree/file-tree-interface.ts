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
    editableText?: string;
}

export type FinalizeMoveHandler<T> = (
    node: TreeNode<T>,
    destParentNodeId: string,
) => Promise<boolean>;

export interface TreeNodeTextEdit<T> {
    id: string;
    text: string;
    data: T;
}

export type ConfirmNodeTextEditHandler<T> = (
    node: TreeNode<T>,
) => Promise<TreeNodeTextEdit<T> | null>;

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

export interface FileTreeProps<T> {
    service: FileTreeService<T>;
    node: TreeNode<T>;
    depth?: number;
    folderLabel?: Snippet<[TreeNode<T>, boolean]>;
    leafLabel?: Snippet<[TreeNode<T>]>;
    nodeContextMenu?: Snippet<[TreeNode<T>]>;
}
