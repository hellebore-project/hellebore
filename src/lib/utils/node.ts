import { NodeId, ROOT_FOLDER_ID, ROOT_FOLDER_NODE_ID } from "../interface";

export function articleNodeId(id: any) {
    if (typeof id === "string" && id.substring(0, 1) == "A") return id;
    return `A${id}`;
}

export function folderNodeId(id: any, root: NodeId = ROOT_FOLDER_NODE_ID) {
    if (id === ROOT_FOLDER_ID || id === root) return root;
    if (typeof id === "string" && id.substring(0, 1) == "F") return id;
    return `F${id}`;
}

export function convertNodeIdToEntityId(id: NodeId): number {
    if (id === ROOT_FOLDER_NODE_ID) return ROOT_FOLDER_ID;
    const _id = id.toString();
    return Number(_id.slice(1));
}

export function isArticleNode(nodeId: NodeId) {
    const _id = nodeId.toString();
    return _id.substring(0, 1) == "A";
}

export function isFolderNode(nodeId: NodeId) {
    const _id = nodeId.toString();
    return _id.substring(0, 1) == "F";
}
