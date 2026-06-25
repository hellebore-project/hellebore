<script lang="ts" generics="T">
    import TreeBranch from "./tree-branch.svelte";
    import type { TreeProps } from "./tree-interface";

    const {
        service,
        node,
        branchLabel,
        leafLabel,
        nodeContextMenu,
    }: TreeProps<T> = $props();
</script>

<div class="flex flex-col h-full">
    <TreeBranch
        {service}
        {node}
        depth={0}
        {branchLabel}
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
