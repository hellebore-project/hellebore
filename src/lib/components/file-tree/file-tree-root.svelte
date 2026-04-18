<script lang="ts" generics="T">
    import FileTreeBranch from "./file-tree-branch.svelte";
    import type { FileTreeProps } from "./file-tree-interface";

    const {
        service,
        node,
        folderLabel,
        leafLabel,
        nodeContextMenu,
    }: FileTreeProps<T> = $props();
</script>

<div class="flex flex-col h-full">
    <FileTreeBranch
        {service}
        {node}
        depth={0}
        {folderLabel}
        {leafLabel}
        {nodeContextMenu}
    />
    {#if node.id === service.rootNodeId}
        <div
            class="flex-1 min-h-7 h-full"
            ondragover={(e) => service.handleNodeDragOverById(e, node.id)}
            ondragenter={(e) => service.handleNodeDragEnterById(e, node.id)}
            ondragleave={(e) => service.handleNodeDragLeaveById(e, node.id)}
            ondrop={(e) => service.handleNodeDropById(e, node.id)}
            aria-hidden="true"
        ></div>
    {/if}
</div>
