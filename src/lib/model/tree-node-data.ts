import { TreeNodeData } from "@mantine/core";

import { EntityType } from "../interface";
import { compareStrings } from "../utils/string";

export interface ArticleTreeNodeData extends TreeNodeData {
    id?: number;
    entityType?: EntityType | null;
}

export const compareTreeNodes = (a: TreeNodeData, b: TreeNodeData) =>
    compareStrings(a.label as string, b.label as string);

export const copyNode = (n: TreeNodeData): TreeNodeData => {
    const copy: TreeNodeData = {
        label: n.label,
        value: n.value,
    };
    if (n.children) copy["children"] = n.children.map(copyNode);
    return copy;
};
