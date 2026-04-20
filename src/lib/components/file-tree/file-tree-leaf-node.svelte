<script lang="ts" generics="T">
    import { cn } from "@/lib/utils";
    import * as ContextMenu from "@/lib/components/context-menu";

    import type { LeafNodeProps } from "./file-tree-interface";
    import FileTreeEditableLabel from "./file-tree-editable-label.svelte";

    const { service, node, leafLabel, contextMenu, depth }: LeafNodeProps<T> =
        $props();
</script>

<ContextMenu.Root
    onOpenChangeComplete={(open) => service.handleContextMenuStatusChange(open)}
>
    <ContextMenu.Trigger>
        {#snippet child({ props })}
            <div
                {...props}
                class={cn(
                    "flex items-center gap-1 px-1 py-0.5 cursor-pointer select-none",
                    "hover:bg-sidebar-accent rounded-sm text-sm text-sidebar-foreground",
                    service.isNodeSelected(node) &&
                        "bg-sidebar-accent font-medium",
                    service.draggingNodeId === node.id && "opacity-40",
                )}
                style="padding-left: {depth * 12 + 20}px"
                role="button"
                tabindex="0"
                draggable="true"
                ondragstart={(e) => service.handleDragStartById(e, node.id)}
                ondragend={() => service.handleDragEnd()}
                onclick={() => service.selectNode(node)}
                onkeydown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        service.selectNode(node);
                    }
                }}
            >
                {#if service.isNodeEditable(node.id)}
                    <FileTreeEditableLabel {service} {node} />
                {:else if leafLabel}
                    {@render leafLabel(node)}
                {:else}
                    <span class="flex-1 min-w-0 truncate">{node.text}</span>
                {/if}
            </div>
        {/snippet}
    </ContextMenu.Trigger>
    <ContextMenu.Content onCloseAutoFocus={(e) => e.preventDefault()}>
        {#if contextMenu}
            {@render contextMenu(node)}
        {/if}
    </ContextMenu.Content>
</ContextMenu.Root>
