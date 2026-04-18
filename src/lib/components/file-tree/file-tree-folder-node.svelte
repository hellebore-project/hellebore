<script lang="ts" generics="T">
    import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";

    import { cn } from "@/lib/utils";
    import { Input } from "@/lib/components/input";
    import * as ContextMenu from "@/lib/components/context-menu";

    import type { FolderNodeProps } from "./file-tree-interface";
    import FileTreeBranch from "./file-tree-branch.svelte";

    const {
        service,
        node,
        folderLabel,
        leafLabel,
        contextMenu,
        depth,
    }: FolderNodeProps<T> = $props();
</script>

<ContextMenu.Root>
    <ContextMenu.Trigger>
        {#snippet child({ props })}
            <div
                {...props}
                class={cn(
                    "flex items-center gap-1 px-1 py-0.5 cursor-pointer select-none",
                    "hover:bg-sidebar-accent rounded-sm text-sm text-sidebar-foreground",
                    service.dragOverFolderId === node.id &&
                        "ring-1 ring-sidebar-ring bg-sidebar-accent",
                )}
                style="padding-left: {depth * 12 + 4}px"
                role="button"
                tabindex="0"
                draggable="true"
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

                {#if node.isEditable}
                    <Input
                        class="flex-1 min-w-0"
                        autofocus
                        value={node.editableText ?? ""}
                        oninput={(e) =>
                            service.setNodeEditText(
                                node.id,
                                e.currentTarget.value,
                            )}
                        onblur={() => service.commitNodeTextEdit(node)}
                        onkeydown={(e) => service.handleKeydown(e, node)}
                        onclick={(e) => e.stopPropagation()}
                    />
                {:else if folderLabel}
                    {@render folderLabel(node, service.isCollapsed(node.id))}
                {:else}
                    <span class="flex-1 min-w-0 truncate">{node.text}</span>
                {/if}
            </div>
        {/snippet}
    </ContextMenu.Trigger>
    <ContextMenu.Content>
        {#if contextMenu}
            {@render contextMenu(node)}
        {/if}
    </ContextMenu.Content>
</ContextMenu.Root>

{#if !service.isCollapsed(node.id)}
    <FileTreeBranch
        {service}
        {node}
        {folderLabel}
        {leafLabel}
        nodeContextMenu={contextMenu}
        depth={depth + 1}
    />
{/if}
