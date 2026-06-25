<script lang="ts">
    import FolderIcon from "@lucide/svelte/icons/folder";
    import FolderOpenIcon from "@lucide/svelte/icons/folder-open";
    import FileIcon from "@lucide/svelte/icons/file";

    import * as Tree from "@/lib/components/tree";
    import * as ContextMenu from "@/lib/components/context-menu";

    import type { EntrySpotlightProps } from "./entry-spotlight-interface";

    const { service }: EntrySpotlightProps = $props();

    $effect(() => {
        const handlePointerDown = (e: PointerEvent) => {
            if (
                service.focused &&
                // FIXME: this is a terrible implementation; don't rely on data attributes in the DOM for this
                !(e.target as Element).closest("[data-spotlight]")
            ) {
                service.focused = false;
            }
        };
        document.addEventListener("pointerdown", handlePointerDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
        };
    });
</script>

<div class="flex flex-col h-full" data-spotlight role="tree">
    <div class="flex-1 min-h-0 overflow-y-auto px-1 pt-1">
        <Tree.Root service={service.tree} node={service.tree.rootNode}>
            {#snippet branchLabel(node, collapsed)}
                {#if collapsed}
                    <FolderIcon
                        class="size-3.5 shrink-0 text-muted-foreground"
                    />
                {:else}
                    <FolderOpenIcon
                        class="size-3.5 shrink-0 text-muted-foreground"
                    />
                {/if}
                <span class="flex-1 min-w-0 truncate">{node.text}</span>
            {/snippet}
            {#snippet leafLabel(node)}
                <FileIcon class="size-3.5 shrink-0 text-muted-foreground" />
                <span class="flex-1 min-w-0 truncate">{node.text}</span>
            {/snippet}
            {#snippet nodeContextMenu(node)}
                <ContextMenu.Item
                    onclick={() => service.handleContextMenuItemRename(node)}
                >
                    Rename
                </ContextMenu.Item>
                <ContextMenu.Item
                    onclick={() => service.handleContextMenuItemDelete(node)}
                >
                    Delete
                </ContextMenu.Item>
            {/snippet}
        </Tree.Root>
    </div>
</div>
