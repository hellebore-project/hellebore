<script lang="ts" generics="T">
    import type { BranchProps } from "./tree-interface";
    import TreeBranchNode from "./tree-branch-node.svelte";
    import TreeLeafNode from "./tree-leaf-node.svelte";

    const {
        service,
        node,
        depth = 0,
        branchLabel,
        leafLabel,
        branchContextMenu,
        leafContextMenu,
    }: BranchProps<T> = $props();
</script>

<div class="flex flex-col">
    <ul class="w-full list-none p-0 m-0">
        {#each service.getChildNodes(node.id) as child (child.id)}
            <li
                class="list-none"
                ondragenter={(e) => {
                    e.stopPropagation();
                    service.handleNodeDragEnter(e, child);
                }}
                ondragover={(e) => {
                    e.stopPropagation();
                    service.handleNodeDragOver(e, child);
                }}
                ondragleave={(e) => {
                    e.stopPropagation();
                    service.handleNodeDragLeave(e, child);
                }}
                ondrop={(e) => {
                    e.stopPropagation();
                    service.handleNodeDrop(e, child);
                }}
            >
                {#if service.isBranchNode(child)}
                    <TreeBranchNode
                        {service}
                        node={child}
                        {depth}
                        {branchLabel}
                        {leafLabel}
                        {branchContextMenu}
                        {leafContextMenu}
                    />
                {:else}
                    <TreeLeafNode
                        {service}
                        node={child}
                        {depth}
                        {leafLabel}
                        contextMenu={leafContextMenu}
                    />
                {/if}
            </li>
        {/each}
    </ul>
</div>
