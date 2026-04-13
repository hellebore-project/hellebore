<script lang="ts" generics="T">
    import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
    import type { Snippet } from "svelte";

    import { cn } from "@/lib/utils";
    import { Input } from "@/lib/components/input";

    import type { FileTreeService } from "./file-tree-service.svelte";
    import type { TreeNode } from "./file-tree-interface";
    import FileTree from "./file-tree.svelte";

    interface FolderNodeProps {
        service: FileTreeService<T>;
        node: TreeNode<T>;
        folderLabel?: Snippet<[TreeNode<T>, boolean]>;
        leafLabel?: Snippet<[TreeNode<T>]>;
        depth: number;
    }

    const { service, node, folderLabel, leafLabel, depth }: FolderNodeProps =
        $props();
</script>

<div
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
                service.setNodeEditText(node.id, e.currentTarget.value)}
            onblur={() => service.onConfirmEdit(node)}
            onkeydown={(e) => service.handleKeydown(e, node)}
            onclick={(e) => e.stopPropagation()}
        />
    {:else if folderLabel}
        {@render folderLabel(node, service.isCollapsed(node.id))}
    {:else}
        <span class="flex-1 min-w-0 truncate">{node.text}</span>
    {/if}
</div>

{#if !service.isCollapsed(node.id)}
    <FileTree
        {service}
        {folderLabel}
        {leafLabel}
        parentId={node.id}
        depth={depth + 1}
    />
{/if}
