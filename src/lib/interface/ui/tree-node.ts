import { NodeModel } from "@minoru/react-dnd-treeview";

export type NodeId = number | string;

export interface ArticleNodeData {
    isPlaceholder?: boolean;
    isEditable?: boolean;
    editableText?: string;
}
export type ArticleNodeModel = NodeModel<ArticleNodeData>;

export const ROOT_FOLDER_NODE_ID = "R";
