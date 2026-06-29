<script lang="ts" generics="T">
    import TreeBranch from "./tree-branch.svelte";
    import type { TreeProps } from "./tree-interface";
    import { ROOT_NODE_DROP_TARGET_TEST_ID } from "./constants";

    const {
        service,
        node,
        branchLabel,
        leafLabel,
        branchContextMenu,
        leafContextMenu,
    }: TreeProps<T> = $props();
</script>

<div class="flex flex-col h-full">
    <TreeBranch
        {service}
        {node}
        depth={0}
        {branchLabel}
        {leafLabel}
        {branchContextMenu}
        {leafContextMenu}
    />
    <div
        class="flex-1 min-h-7 h-full"
        data-testid={ROOT_NODE_DROP_TARGET_TEST_ID}
        aria-hidden="true"
        ondragover={(e) => service.handleNodeDragOverById(e, node.id)}
        ondragenter={(e) => service.handleNodeDragEnterById(e, node.id)}
        ondragleave={(e) => service.handleNodeDragLeaveById(e, node.id)}
        ondrop={(e) => service.handleNodeDropById(e, node.id)}
    ></div>
</div>
