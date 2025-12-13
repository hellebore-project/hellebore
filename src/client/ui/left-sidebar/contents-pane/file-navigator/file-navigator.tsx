import "./file-navigator.css";

import { Paper, Text } from "@mantine/core";
import {
    DragPreviewRender,
    DropOptions,
    getBackendOptions,
    MultiBackend,
    Tree,
} from "@minoru/react-dnd-treeview";
import { observer } from "mobx-react-lite";
import { DndProvider } from "react-dnd";

import { BaseGroupProps } from "@/interface";
import {
    FileNodeData,
    FileNodeModel,
    getService,
    ROOT_FOLDER_NODE_ID,
} from "@/client";
import { NavItem, NavItemTextProps } from "@/shared/nav-item";

interface FileNavItemProps extends BaseGroupProps {
    node: FileNodeModel;
    depth: number;
    expanded: boolean;
    toggle: () => void;
}

function renderFileNavItem({
    node,
    depth,
    expanded,
    toggle,
    ...rest
}: FileNavItemProps) {
    const clientManager = getService();
    const fileNav = clientManager.navigation.files;

    const selected = fileNav.selectedNodeId == node.id;
    const displayed = fileNav.displayedNode?.id == node.id;
    const editable = node?.data?.isEditable ?? false;

    const textProps: NavItemTextProps = {
        editable,
        text: editable ? (node?.data?.editableText ?? node.text) : node.text,
        error: node?.data?.error,
    };

    const textElementId = fileNav.convertNodeIdToDOMTextId(node.id);

    if (selected && editable) {
        textProps.textInputProps = {
            id: textElementId,
            onChange: (event) =>
                fileNav.setEditableNodeText(node.id, event.target.value),
            onBlur: () => fileNav.confirmNodeTextEdit(node),
            variant: "unstyled",
            size: "xs",
            styles: { input: { fontSize: 16 } },
        };
        textProps.ref_ = fileNav.editableTextRef ?? undefined;
    } else
        textProps.textProps = {
            id: textElementId,
        };

    return (
        <NavItem
            active={displayed}
            selected={selected}
            focused={fileNav.focused}
            rank={depth + 1}
            groupProps={{
                id: fileNav.convertNodeIdToDOMId(node.id),
                onClick: (e) => {
                    e.stopPropagation();
                    fileNav.selectNode(node, toggle);
                },
                onContextMenu: (e) => fileNav.openContextMenu(e),
                ...rest,
            }}
            textProps={textProps}
            expandButtonProps={{
                expandable: node.droppable,
                expanded: expanded,
            }}
        />
    );
}

export const FileNavItem = observer(renderFileNavItem);

function renderFileNavErrorPopover() {
    const service = getService();
    const errorManager = service.navigation.files.errorManager;

    if (!errorManager.visible || !errorManager.position) return null;
    const position = errorManager.position;

    return (
        <Paper
            className="file-navigator-error-popover"
            left={position.left}
            top={position.top}
            w={position.right - position.left}
        >
            <Text className="file-navigator-error-text">
                {errorManager.message}
            </Text>
        </Paper>
    );
}

export const FileNavErrorPopover = observer(renderFileNavErrorPopover);

function renderFileNavigator() {
    const service = getService();
    const fileNav = service.navigation.files;

    const data = fileNav.nodes;

    const dragPreviewRender: DragPreviewRender<FileNodeData> = (
        monitorProps,
    ) => <div>{monitorProps.item.text}</div>;

    const onDrop = (
        _: unknown,
        { dragSource, dropTargetId }: DropOptions<FileNodeData>,
    ) => {
        if (dragSource)
            fileNav.moveNode(dragSource, dropTargetId).then((moved) => {
                if (moved)
                    // NOTE: the `open` function can't be called inside a service
                    fileNav.tree?.current?.open(dropTargetId);
            });
    };

    return (
        <>
            <div className="file-navigator">
                <DndProvider
                    backend={MultiBackend}
                    options={getBackendOptions()}
                >
                    <Tree
                        classes={{
                            root: "file-tree-root",
                        }}
                        dragPreviewRender={dragPreviewRender}
                        listComponent="div"
                        listItemComponent="div"
                        onDrop={onDrop}
                        ref={fileNav.tree}
                        render={(node, { depth, isOpen, onToggle }) => (
                            <FileNavItem
                                depth={depth}
                                expanded={isOpen}
                                key={node.id}
                                node={node}
                                toggle={onToggle}
                            />
                        )}
                        rootId={ROOT_FOLDER_NODE_ID}
                        tree={data}
                    />
                </DndProvider>
            </div>
            <FileNavErrorPopover />
        </>
    );
}

export const FileNavigator = observer(renderFileNavigator);
