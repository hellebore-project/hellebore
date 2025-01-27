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
    NavItem,
    PopoverSettings,
    TextSettings,
} from "@/shared/nav-item/nav-item";
import { TextFieldSettings } from "@/shared/text-field";
import { convertNodeIdToEntityId } from "@/utils/node";

import "./file-navigator.css";
import { OutsideClickHandler } from "@/shared/outside-click-handler";
import { NAVBAR_BG_COLOR } from "@/constants";

const ARTICLE_NAV_ITEM_PREFIX = "nav-item-";
const SELECTED_NAV_ITEM_BORDER_STYLE = {
    borderStyle: "solid",
    borderWidth: "1px",
};
const OUTSIDE_CLICK_HANDLER_STYLE = {
    height: "100%",
    paddingLeft: "0",
    paddingRight: "0",
};

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
    const fileNavigator = service.view.navigation.files;

    const elementId = e.currentTarget.id;
    const nodeId = elementId.slice(ARTICLE_NAV_ITEM_PREFIX.length);

    const node = fileNavigator.getNode(nodeId);
    if (!node) return;

    fileNavigator.focused = false;
    fileNavigator.selectedNode = node;
    const id = convertNodeIdToEntityId(nodeId);

    if (fileNavigator.isFolderNode(node))
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
            const id = convertNodeIdToEntityId(node.id);
            service.view
                .openArticleEditorForId(id)
                .then(() => fileNav.openNode(node));
        }
    };

    let textSettings: TextSettings | undefined = undefined;
    let textInputSettings: TextFieldSettings | undefined = undefined;
    if (selected && editable)
        textInputSettings = {
            value: node?.data?.editableText ?? node.text,
            readOnly: false,
            autoFocus: true,
            error: node?.data?.error ? true : undefined,
            onChange: (event) =>
                fileNav.setEditableNodeText(node.id, event.target.value),
            onBlur: () => fileNav.confirmNodeTextEdit(node),
            variant: "unstyled",
            size: "xs",
            styles: { input: { fontSize: 16 } },
        };
    else
        textSettings = {
            value: node.text,
        };

    let popoverSettings: PopoverSettings | undefined = undefined;
    if (node?.data?.error)
        popoverSettings = {
            opened: true,
            text: node?.data?.error ?? "",
        };

    let variant: string = "filled-hover";
    if (fileNav.focused) {
        if (selected && open) variant = "selected-nohover";
        else if (selected) variant = "selected-outline-nohover";
        else if (open) variant = "selected-filled-nohover";
    } else {
        if (selected && !open) variant = "filled-hover";
        if (open) variant = "highlighted-nohover";
    }

    const borderStyle = selected ? SELECTED_NAV_ITEM_BORDER_STYLE : undefined;

    return (
        <NavItem
            id={`${ARTICLE_NAV_ITEM_PREFIX}${node.id}`}
            variant={variant}
            c="white"
            bg={NAVBAR_BG_COLOR}
            style={borderStyle}
            indentSettings={{
                count: depth + 1,
            }}
            textSettings={textSettings}
            textInputSettings={textInputSettings}
            expandButtonSettings={{
                expandable: node.droppable,
                expanded: expanded,
            }}
            popoverSettings={popoverSettings}
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
            display="block"
            state={fileNav.outsideClickHandler}
            onClick={() => {
                fileNav.selectedNode = null;
                fileNav.focused = true;
            }}
            style={OUTSIDE_CLICK_HANDLER_STYLE}
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
