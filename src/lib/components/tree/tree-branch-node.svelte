<script lang="ts" generics="T">
    import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";

    import { cn } from "@/lib/utils";
    import * as ContextMenu from "@/lib/components/context-menu";

    import type { BranchNodeProps } from "./tree-interface";
    import TreeBranch from "./tree-branch.svelte";
    import TreeEditableLabel from "./tree-editable-label.svelte";

    const {
        service,
        node,
        branchLabel,
        leafLabel,
        contextMenu,
        depth,
    }: BranchNodeProps<T> = $props();
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
                    service.dragOverBranchId === node.id &&
                        "ring-1 ring-sidebar-ring bg-sidebar-accent",
                )}
                style="padding-left: {depth * 12 + 4}px"
                role="button"
                tabindex="0"
                draggable={service.isNodeDraggable(node.id)}
                ondragstart={(e) => service.handleDragStartById(e, node.id)}
                ondragend={() => service.handleDragEnd()}
                onclick={() => service.toggleCollapsed(node.id)}
                onkeydown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        service.toggleCollapsed(node.id);
                    }
                }}
            >
                <ChevronRightIcon
                    class={cn(
                        "size-3.5 shrink-0 transition-transform duration-150",
                        !service.isCollapsed(node.id) && "rotate-90",
                    )}
                />

                {#if service.isNodeEditable(node.id)}
                    <TreeEditableLabel {service} {node} />
                {:else if branchLabel}
                    {@render branchLabel(node, service.isCollapsed(node.id))}
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

{#if !service.isCollapsed(node.id)}
    <TreeBranch
        {service}
        {node}
        {branchLabel}
        {leafLabel}
        nodeContextMenu={contextMenu}
        depth={depth + 1}
    />
{/if}
