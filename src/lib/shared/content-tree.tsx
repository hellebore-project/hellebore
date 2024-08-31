import { Group, GroupProps, Tree, TreeNodeData } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";
import React from "react";

interface NodeLabelSettings extends GroupProps {
    node: TreeNodeData;
    expanded: boolean;
    hasChildren: boolean;
}

interface ContentTreeSettings<N extends TreeNodeData> {
    getData: () => N[];
    onClick?: (node: N) => void;
}

function renderTreeNode({
    node,
    expanded,
    hasChildren,
    ...rest
}: NodeLabelSettings) {
    return (
        <Group gap={5} {...rest}>
            {hasChildren && (
                <IconChevronRight
                    size={18}
                    style={{
                        transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                    }}
                />
            )}
            <span>{node.label}</span>
        </Group>
    );
}

const TreeNode = observer(renderTreeNode);

function renderContentTree<N extends TreeNodeData>({
    getData,
    onClick,
}: ContentTreeSettings<N>) {
    return (
        <Tree
            data={getData()}
            levelOffset={23}
            renderNode={({ node, expanded, hasChildren, elementProps }) => {
                const { onClick: _onClick, ...props } = elementProps;
                const onClickWrapper = (event: React.MouseEvent) => {
                    if (node.children) _onClick(event);
                    onClick?.(node as N);
                };
                return (
                    <TreeNode
                        node={node}
                        expanded={expanded}
                        hasChildren={hasChildren}
                        onClick={onClickWrapper}
                        {...props}
                    />
                );
            }}
        />
    );
}

export const ContentTree = observer(renderContentTree);
