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
import { MouseEvent } from "react";
import { DndProvider } from "react-dnd";

import { BaseGroupSettings } from "@/interface";
import {
    FileNodeData,
    FileNodeModel,
    getService,
    ROOT_FOLDER_NODE_ID,
} from "@/client";
import { NavItem, NavItemTextSettings } from "@/shared/nav-item";

interface FileNavItemSettings extends BaseGroupSettings {
    node: FileNodeModel;
    depth: number;
    expanded: boolean;
    toggle: () => void;
}

interface FileNavigatorSettings {}

const openContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    const service = getService();
    const fileNav = service.navigation.files;

    const elementId = e.currentTarget.id;
    if (!elementId) return;

    const nodeId = fileNav.convertDOMIdToNodeId(elementId);
    const node = fileNav.getNode(nodeId);
    if (!node) return;

    fileNav.focused = false;
    fileNav.selectedNode = node;
    const id = fileNav.convertNodeIdToEntityId(nodeId);

    if (fileNav.isFolderNode(node))
        service.contextMenu.openForNavBarFolderNode({
            id,
            position: { x: e.pageX, y: e.pageY },
            text: node.text,
        });
    else
        service.contextMenu.openForNavBarEntityNode({
            id,
            position: { x: e.pageX, y: e.pageY },
            text: node.text,
        });
};

function renderFileNavItem({
    node,
    depth,
    expanded,
    toggle,
    ...rest
}: FileNavItemSettings) {
    const service = getService();
    const fileNav = service.navigation.files;

    const selected = fileNav.selectedNodeId == node.id;
    const open = fileNav.openedNodeId == node.id;
    const editable = node?.data?.isEditable ?? false;

    const onActivate = (event: MouseEvent) => {
        event.stopPropagation();

        fileNav.focused = true;
        fileNav.selectedNode = node;

        // if the node is editable, then its open status must remain static
        if (editable) return;

        toggle();

        // in case of an entity node, open the corresponding entity in the editor
        if (!fileNav.isFolderNode(node)) {
            const id = fileNav.convertNodeIdToEntityId(node.id);
            service.openArticleEditor(id).then(() => fileNav.openNode(node));
        }
    };

    let textSettings: NavItemTextSettings = {
        editable,
        text: editable ? (node?.data?.editableText ?? node.text) : node.text,
        error: node?.data?.error,
    };

    const textElementId = fileNav.convertNodeIdToDOMTextId(node.id);

    if (selected && editable) {
        textSettings.textInputSettings = {
            id: textElementId,
            onChange: (event) =>
                fileNav.setEditableNodeText(node.id, event.target.value),
            onBlur: () => fileNav.confirmNodeTextEdit(node),
            variant: "unstyled",
            size: "xs",
            styles: { input: { fontSize: 16 } },
        };
        textSettings.ref_ = fileNav.editableTextField ?? undefined;
    } else
        textSettings.textSettings = {
            id: textElementId,
        };

    return (
        <NavItem
            active={open}
            selected={selected}
            focused={fileNav.focused}
            rank={depth + 1}
            groupSettings={{
                id: fileNav.convertNodeIdToDOMId(node.id),
                onClick: onActivate,
                onContextMenu: openContextMenu,
                ...rest,
            }}
            textSettings={textSettings}
            expandButtonSettings={{
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

function renderFileNavigator({}: FileNavigatorSettings) {
    const service = getService();
    const fileNav = service.navigation.files;

    const data = fileNav.nodes;

    const dragPreviewRender: DragPreviewRender<FileNodeData> = (
        monitorProps,
    ) => <div>{monitorProps.item.text}</div>;

    const onDrop = (
        _: any,
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
