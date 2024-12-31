import { GridProps, lighten } from "@mantine/core";
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
import { ThemeManager } from "@/theme";
import { convertNodeIdToEntityId } from "@/utils/node";

import "./file-navigator.css";

const ARTICLE_NAV_ITEM_PREFIX = "nav-item-";

interface FileNavItemSettings extends GridProps {
    node: FileNodeModel;
    depth: number;
    expanded: boolean;
    toggle: () => void;
}

interface FileNavigatorSettings {}

const openContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    const service = getService();
    const articlesService = service.view.navigation.files;

    const elementId = e.currentTarget.id;
    const nodeId = elementId.slice(ARTICLE_NAV_ITEM_PREFIX.length);

    const node = articlesService.getNode(nodeId);
    if (!node) return;

    if (articlesService.isFolderNode(node)) {
        e.preventDefault();
        service.view.contextMenu.openForNavBarFolderNode({
            position: { x: e.pageX, y: e.pageY },
            id: convertNodeIdToEntityId(nodeId),
            nodeId,
        });
    }
};

function renderFileNavItem({
    node,
    depth,
    expanded,
    toggle,
    bg,
    ...rest
}: FileNavItemSettings) {
    const service = getService();

    const selected = service.view.navigation.files.selectedNodeId == node.id;
    const editable = node?.data?.isEditable ?? false;

    const onActivate = () => {
        if (editable) return;
        toggle();
        service.view.navigation.files.selectNode(node);
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
                service.view.navigation.files.editNodeText(
                    node.id,
                    event.target.value,
                ),
            onBlur: () =>
                service.view.navigation.files.confirmNodeTextEdit(node),
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

    if (selected) {
        const normalBg = bg
            ? ThemeManager.getThemeColor(bg).color
            : ThemeManager.getDefaultThemeColor();
        bg = lighten(normalBg, 0.1);
    }

    return (
        <NavItem
            id={`${ARTICLE_NAV_ITEM_PREFIX}${node.id}`}
            bg={bg}
            indentSettings={{
                count: depth + 1,
            }}
            expandButtonSettings={{
                expandable: node.droppable,
                expanded: expanded,
            }}
            textSettings={textSettings}
            textInputSettings={textInputSettings}
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

    const ref = useRef(null);
    service.view.navigation.files.tree = ref;

    const data = service.view.navigation.files.nodes;

    const dragPreviewRender: DragPreviewRender<FileNodeData> = (
        monitorProps,
    ) => <div>{monitorProps.item.text}</div>;

    const onDrop = (
        _: any,
        { dragSource, dropTargetId }: DropOptions<FileNodeData>,
    ) => {
        if (dragSource)
            service.view.navigation.files.moveNode(dragSource, dropTargetId);
    };

    return (
        <DndProvider backend={MultiBackend} options={getBackendOptions()}>
            <Tree
                ref={ref}
                tree={data}
                rootId={ROOT_FOLDER_NODE_ID}
                listComponent="div"
                listItemComponent="div"
                dragPreviewRender={dragPreviewRender}
                onDrop={onDrop}
                render={(node, { depth, isOpen, onToggle }) => (
                    <FileNavItem
                        key={node.id}
                        node={node}
                        depth={depth}
                        expanded={isOpen}
                        toggle={onToggle}
                    />
                )}
                classes={{
                    root: "article-tree-root",
                }}
            />
        </DndProvider>
    );
}

export const FileNavigator = observer(renderFileNavigator);
