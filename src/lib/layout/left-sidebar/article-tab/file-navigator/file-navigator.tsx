import { GridProps } from "@mantine/core";
import {
    DragPreviewRender,
    DropOptions,
    getBackendOptions,
    MultiBackend,
    Tree,
} from "@minoru/react-dnd-treeview";
import { observer } from "mobx-react-lite";
import { MouseEvent, useRef } from "react";
import { DndProvider } from "react-dnd";

import { FileNodeData, FileNodeModel, ROOT_FOLDER_NODE_ID } from "@/interface";
import { getService } from "@/services";
import {
    EditableTextSettings,
    NavItem,
    PopoverSettings,
    TextSettings,
} from "@/shared/nav-item/nav-item";
import { TextFieldSettings } from "@/shared/text-field";

import "./file-navigator.css";
import { OutsideClickHandler } from "@/shared/outside-click-handler";

const ARTICLE_NAV_ITEM_PREFIX = "nav-item-";

interface FileNavItemSettings extends GridProps {
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
    const nodeId = elementId.slice(ARTICLE_NAV_ITEM_PREFIX.length);

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

    let textSettings: TextSettings | undefined = undefined;
    let editableTextSettings: EditableTextSettings | undefined = undefined;

    if (selected && editable) {
        editableTextSettings = {
            value: node?.data?.editableText ?? node.text,
            readOnly: false,
            error: node?.data?.error ? true : undefined,
            onChange: (event) =>
                fileNav.setEditableNodeText(node.id, event.target.value),
            onBlur: () => fileNav.confirmNodeTextEdit(node),
            variant: "unstyled",
            size: "xs",
            styles: { input: { fontSize: 16 } },
        };

        if (node?.data?.error)
            editableTextSettings.popoverSettings = {
                opened: true,
                text: node?.data?.error ?? "",
            };
    } else
        textSettings = {
            value: node.text,
        };

    return (
        <NavItem
            id={`${ARTICLE_NAV_ITEM_PREFIX}${node.id}`}
            active={open}
            selected={selected}
            focused={fileNav.focused}
            rank={depth + 1}
            textSettings={textSettings}
            textInputSettings={editableTextSettings}
            expandButtonSettings={{
                expandable: node.droppable,
                expanded: expanded,
            }}
            onClick={onActivate}
            onContextMenu={openContextMenu}
            {...rest}
        ></NavItem>
    );
}

export const FileNavItem = observer(renderFileNavItem);

function renderFileNavigator({}: FileNavigatorSettings) {
    const service = getService();
    const fileNav = service.view.navigation.files;

    const ref = useRef(null);
    fileNav.tree = ref;

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

    return (
        <OutsideClickHandler
            className="file-navigator"
            service={fileNav.outsideClickHandler}
            onClick={() => {
                fileNav.selectedNode = null;
                fileNav.focused = true;
            }}
        >
            <DndProvider backend={MultiBackend} options={getBackendOptions()}>
                <Tree
                    classes={{
                        root: "article-tree-root",
                    }}
                    dragPreviewRender={dragPreviewRender}
                    listComponent="div"
                    listItemComponent="div"
                    onDrop={onDrop}
                    ref={ref}
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
    );
}

export const FileNavigator = observer(renderFileNavigator);
