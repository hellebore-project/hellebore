<script lang="ts" generics="T">
    import type { Snippet } from "svelte";

    import { cn } from "@/lib/utils";

    import type { FileTreeService } from "./file-tree-service.svelte";
    import type { TreeNode } from "./file-tree-interface";

    interface LeafNodeProps {
        service: FileTreeService<T>;
        node: TreeNode<T>;
        leafLabel?: Snippet<[TreeNode<T>]>;
        depth: number;
    }

    const { service, node, leafLabel, depth }: LeafNodeProps = $props();
</script>

<div
    class={cn(
        "flex items-center gap-1 px-1 py-0.5 cursor-pointer select-none",
        "hover:bg-sidebar-accent rounded-sm text-sm text-sidebar-foreground",
        service.isLeafSelected(node) && "bg-sidebar-accent font-medium",
        service.draggingNodeId === node.id && "opacity-40",
    )}
    style="padding-left: {depth * 12 + 20}px"
    role="button"
    tabindex="0"
    draggable="true"
    ondragstart={(e) => service.handleDragStartById(e, node.id)}
    ondragend={() => service.handleDragEnd()}
    onclick={() => service.selectLeaf(node)}
    onkeydown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            service.selectLeaf(node);
        }
    }}
>
    {#if leafLabel}
        {@render leafLabel(node)}
    {:else}
        <span class="flex-1 min-w-0 truncate">{node.text}</span>
    {/if}
</div>
