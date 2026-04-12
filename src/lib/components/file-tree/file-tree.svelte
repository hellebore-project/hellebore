<script lang="ts" generics="T">
    import type { FileTreeProps } from "./file-tree-interface";
    import FileTreeFolderNode from "./folder-node.svelte";
    import FileTreeLeafNode from "./leaf-node.svelte";

    const {
        service,
        folderLabel,
        leafLabel,
        parentId = "root",
        depth = 0,
    }: FileTreeProps<T> = $props();

    let children = $derived(service.getChildren(parentId));
</script>

<div class="flex flex-col h-full">
    <ul class="w-full list-none p-0 m-0">
        {#each children as node (node.id)}
            <li
                class="list-none"
                ondragenter={(e) => {
                    e.stopPropagation();
                    service.handleNodeDragEnter(e, node);
                }}
                ondragover={(e) => {
                    e.stopPropagation();
                    service.handleNodeDragOver(e, node);
                }}
                ondragleave={(e) => {
                    e.stopPropagation();
                    service.handleNodeDragLeave(e, node);
                }}
                ondrop={(e) => {
                    e.stopPropagation();
                    service.handleNodeDrop(e, node);
                }}
            >
                {#if node.isFolder}
                    <FileTreeFolderNode
                        {service}
                        {node}
                        {folderLabel}
                        {leafLabel}
                        {depth}
                    />
                {:else}
                    <FileTreeLeafNode {service} {node} {leafLabel} {depth} />
                {/if}
            </li>
        {/each}
    </ul>
    {#if parentId === service.rootNodeId}
        <div
            class="flex-1 min-h-7"
            ondragover={(e) => service.handleDragOver(e, parentId)}
            ondragenter={(e) => service.handleDragEnter(e, parentId)}
            ondragleave={(e) => service.handleDragLeave(e, parentId)}
            ondrop={(e) => service.handleDrop(e, parentId)}
            aria-hidden="true"
        ></div>
    {/if}
</div>
