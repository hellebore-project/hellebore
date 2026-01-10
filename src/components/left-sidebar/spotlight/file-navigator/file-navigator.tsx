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

import { ROOT_FOLDER_NODE_ID } from "@/constants";
import { BaseGroupProps, FileNodeData, FileNodeModel } from "@/interface";
import { NavItem, NavItemTextProps } from "@/components/lib/nav-item";

import { FileNavigatorErrorManager } from "./file-navigator-error.service";
import { SpotlightService } from "../spotlight.service";

interface FileNavErrorProps {
    service: FileNavigatorErrorManager;
}

interface FileNavItemProps extends BaseGroupProps {
    node: FileNodeModel;
    depth: number;
    expanded: boolean;
    toggle: () => void;
    service: SpotlightService;
}

interface FileNavProps {
    service: SpotlightService;
}

function renderFileNavItem({
    node,
    depth,
    expanded,
    toggle,
    service,
    ...rest
}: FileNavItemProps) {
    const selected = service.selectedNodeId == node.id;
    const displayed = service.displayedNode?.id == node.id;
    const editable = node?.data?.isEditable ?? false;

    const textProps: NavItemTextProps = {
        editable,
        text: editable ? (node?.data?.editableText ?? node.text) : node.text,
        error: node?.data?.error,
    };

    const textElementId = service.convertNodeIdToDOMTextId(node.id);

    if (selected && editable) {
        textProps.textInputProps = {
            id: textElementId,
            onChange: (event) =>
                service.setEditableNodeText(node.id, event.target.value),
            onBlur: () => service.confirmNodeTextEdit(node),
            variant: "unstyled",
            size: "xs",
            styles: { input: { fontSize: 16 } },
        };
        textProps.ref_ = service.editableTextRef ?? undefined;
    } else
        textProps.textProps = {
            id: textElementId,
        };

    return (
        <NavItem
            active={displayed}
            selected={selected}
            focused={service.focused}
            rank={depth + 1}
            groupProps={{
                id: service.convertNodeIdToDOMId(node.id),
                onClick: (e) => {
                    e.stopPropagation();
                    service.selectNode(node, toggle);
                },
                onContextMenu: (e) => service.openContextMenu(e),
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

function renderFileNavErrorPopover({ service }: FileNavErrorProps) {
    if (!service.visible || !service.position) return null;
    const position = service.position;

    return (
        <Paper
            className="file-navigator-error-popover"
            left={position.left}
            top={position.top}
            w={position.right - position.left}
        >
            <Text className="file-navigator-error-text">{service.message}</Text>
        </Paper>
    );
}

export const FileNavErrorPopover = observer(renderFileNavErrorPopover);

function renderFileNavigator({ service }: FileNavProps) {
    const data = service.nodes;

    const dragPreviewRender: DragPreviewRender<FileNodeData> = (
        monitorProps,
    ) => <div>{monitorProps.item.text}</div>;

    const onDrop = (
        _: unknown,
        { dragSource, dropTargetId }: DropOptions<FileNodeData>,
    ) => {
        if (dragSource)
            service.moveNode(dragSource, dropTargetId).then((moved) => {
                if (moved)
                    // NOTE: the `open` function can't be called inside a service
                    service.tree?.current?.open(dropTargetId);
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
                        ref={service.tree}
                        render={(node, { depth, isOpen, onToggle }) => (
                            <FileNavItem
                                depth={depth}
                                expanded={isOpen}
                                key={node.id}
                                node={node}
                                toggle={onToggle}
                                service={service}
                            />
                        )}
                        rootId={ROOT_FOLDER_NODE_ID}
                        tree={data}
                    />
                </DndProvider>
            </div>
            <FileNavErrorPopover service={service.errorManager} />
        </>
    );
}

export const FileNavigator = observer(renderFileNavigator);
