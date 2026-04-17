<script lang="ts" generics="T">
    import type { FileTreeProps } from "./file-tree-interface";
    import FileTreeFolderNode from "./folder-node.svelte";
    import FileTreeLeafNode from "./leaf-node.svelte";

    const {
        service,
        node,
        folderLabel,
        leafLabel,
        depth = 0,
    }: FileTreeProps<T> = $props();
</script>

<div class="flex flex-col h-full">
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
                {#if service.isFolderNode(child)}
                    <FileTreeFolderNode
                        {service}
                        node={child}
                        {folderLabel}
                        {leafLabel}
                        {depth}
                    />
                {:else}
                    <FileTreeLeafNode
                        {service}
                        node={child}
                        {leafLabel}
                        {depth}
                    />
                {/if}
            </li>
        {/each}
    </ul>
    {#if node.id === service.rootNodeId}
        <div
            class="flex-1 min-h-7"
            ondragover={(e) => service.handleNodeDragOverById(e, node.id)}
            ondragenter={(e) => service.handleNodeDragEnterById(e, node.id)}
            ondragleave={(e) => service.handleNodeDragLeaveById(e, node.id)}
            ondrop={(e) => service.handleNodeDropById(e, node.id)}
            aria-hidden="true"
        ></div>
    {/if}
</div>
