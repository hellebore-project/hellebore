<script lang="ts">
    import FolderIcon from "@lucide/svelte/icons/folder";
    import FolderOpenIcon from "@lucide/svelte/icons/folder-open";
    import FileIcon from "@lucide/svelte/icons/file";

    import * as Tree from "@/lib/components/tree";
    import * as ContextMenu from "@/lib/components/context-menu";

    const {
        service,
        onClickContextMenuItem,
    }: {
        service: Tree.TreeService<any>;
        onClickContextMenuItem?: (node: Tree.TreeNode<any>) => void;
    } = $props();
</script>

<Tree.Root {service} node={service.rootNode}>
    {#snippet branchLabel(node, collapsed)}
        {#if collapsed}
            <FolderIcon class="size-3.5 shrink-0 text-muted-foreground" />
        {:else}
            <FolderOpenIcon class="size-3.5 shrink-0 text-muted-foreground" />
        {/if}
        <span class="flex-1 min-w-0 truncate">{node.text}</span>
    {/snippet}
    {#snippet leafLabel(node)}
        <FileIcon class="size-3.5 shrink-0 text-muted-foreground" />
        <span class="flex-1 min-w-0 truncate">{node.text}</span>
    {/snippet}
    {#snippet leafContextMenu(node)}
        <ContextMenu.Item onclick={() => onClickContextMenuItem?.(node)}>
            Test
        </ContextMenu.Item>
    {/snippet}
</Tree.Root>
