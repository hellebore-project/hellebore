import type { Snippet } from "svelte";

import type { FileTreeService } from "./file-tree-service.svelte";

export interface TreeNode<T> {
    id: string;
    parent: string;
    text: string;
    isFolder: boolean;
    isEditable?: boolean;
    editableText?: string;
    data: T;
}

export interface FileTreeProps<T> {
    service: FileTreeService<T>;
    folderLabel?: Snippet<[TreeNode<T>, boolean]>;
    leafLabel?: Snippet<[TreeNode<T>]>;
    parentId?: string;
    depth?: number;
}
