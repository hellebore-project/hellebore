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
import { MouseEvent, useEffect } from "react";
import { DndProvider } from "react-dnd";

import {
    BaseGroupSettings,
    FileNodeData,
    FileNodeModel,
    ROOT_FOLDER_NODE_ID,
} from "@/interface";
import { getService } from "@/services";
import { NavItem, NavItemTextSettings } from "@/shared/nav-item/nav-item";
import { OutsideClickHandler } from "@/shared/outside-click-handler";

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
    const fileNav = service.view.navigation.files;

    const elementId = e.currentTarget.id;
    if (!elementId) return;

    const nodeId = fileNav.convertDOMIdToNodeId(elementId);
    const node = fileNav.getNode(nodeId);
    if (!node) return;

    fileNav.focused = false;
    fileNav.selectedNode = node;
    const id = fileNav.convertNodeIdToEntityId(nodeId);

    if (fileNav.isFolderNode(node))
        service.view.contextMenu.openForNavBarFolderNode({
            position: { x: e.pageX, y: e.pageY },
            id,
            nodeId,
        });
    else
        service.view.contextMenu.openForNavBarArticleNode({
            position: { x: e.pageX, y: e.pageY },
            id,
            nodeId,
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
    const fileNav = service.view.navigation.files;

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

        // in case of an article node, open the corresponding article in the editor
        if (!fileNav.isFolderNode(node)) {
            const id = fileNav.convertNodeIdToEntityId(node.id);
            service.view
                .openArticleEditor(id)
                .then(() => fileNav.openNode(node));
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
    const errorManager = service.view.navigation.files.errorManager;

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
    const fileNav = service.view.navigation.files;

    const data = fileNav.nodes;

    const dragPreviewRender: DragPreviewRender<FileNodeData> = (
        monitorProps,
    ) => <div>{monitorProps.item.text}</div>;

    const onDrop = (
        _: any,
        { dragSource, dropTargetId }: DropOptions<FileNodeData>,
    ) => {
        if (dragSource) fileNav.moveNode(dragSource, dropTargetId);
    };

    const editableTextRef = fileNav.editableTextField;
    useEffect(() => {
        if (editableTextRef?.current) {
            // focus the text field once it has been added to the DOM
            editableTextRef.current.focus();
        }
    }, [editableTextRef]);

    return (
        <>
            <OutsideClickHandler
                className="file-navigator"
                service={fileNav.outsideClickHandler}
                onClick={() => {
                    fileNav.selectedNode = null;
                    fileNav.focused = true;
                }}
            >
                <DndProvider
                    backend={MultiBackend}
                    options={getBackendOptions()}
                >
                    <Tree
                        classes={{
                            root: "article-tree-root",
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
            </OutsideClickHandler>
            <FileNavErrorPopover />
        </>
    );
}

export const FileNavigator = observer(renderFileNavigator);
