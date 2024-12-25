import { GridProps, lighten } from "@mantine/core";
import {
    DragPreviewRender,
    DropOptions,
    getBackendOptions,
    MultiBackend,
    Tree,
} from "@minoru/react-dnd-treeview";
import { observer } from "mobx-react-lite";
import { DndProvider } from "react-dnd";
import { MouseEvent, useRef } from "react";

import {
    ArticleNodeData,
    ArticleNodeModel,
    ROOT_FOLDER_NODE_ID,
} from "@/interface";
import { getService } from "@/services";
import {
    NavItem,
    PopoverSettings,
    TextSettings,
} from "@/shared/nav-item/nav-item";
import { TextFieldSettings } from "@/shared/text-field";
import { ThemeManager } from "@/theme";

import "./article-navigator.css";

interface ArticleNavItemSettings extends GridProps {
    node: ArticleNodeModel;
    depth: number;
    expanded: boolean;
    toggle: () => void;
}

interface ArticleNavigatorSettings {}

function renderArticleNavItem({
    node,
    depth,
    expanded,
    toggle,
    bg,
    ...rest
}: ArticleNavItemSettings) {
    const service = getService();

    const selected = service.view.navigation.articles.selectedNodeId == node.id;
    const editable = node?.data?.isEditable ?? false;

    const onActivate = (event: MouseEvent) => {
        event.stopPropagation();
        if (editable) return;
        toggle();
        service.view.navigation.articles.selectNode(node);
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
                service.view.navigation.articles.editNodeText(
                    node.id,
                    event.target.value,
                ),
            onBlur: () =>
                service.view.navigation.articles.confirmNodeTextEdit(node),
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
            {...rest}
        ></NavItem>
    );
}

export const ArticleNavItem = observer(renderArticleNavItem);

function renderArticleNavigator({}: ArticleNavigatorSettings) {
    const service = getService();

    const ref = useRef(null);
    service.view.navigation.articles.tree = ref;

    const data = service.view.navigation.articles.nodes;

    const dragPreviewRender: DragPreviewRender<ArticleNodeData> = (
        monitorProps,
    ) => <div>{monitorProps.item.text}</div>;

    const onDrop = (
        _: any,
        { dragSource, dropTargetId }: DropOptions<ArticleNodeData>,
    ) => {
        if (dragSource)
            service.view.navigation.articles.moveNode(dragSource, dropTargetId);
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
                    <ArticleNavItem
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

export const ArticleNavigator = observer(renderArticleNavigator);
