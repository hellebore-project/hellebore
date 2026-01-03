import { NodeModel } from "@minoru/react-dnd-treeview";

export const ROOT_FOLDER_NODE_ID = "R"; // TODO: move this to constants

export type NodeId = number | string;

export interface FileNodeData {
    isPlaceholder?: boolean;
    isEditable?: boolean;
    editableText?: string;
    isUnique?: boolean;
    error?: string;
}
export type FileNodeModel = NodeModel<FileNodeData>;
