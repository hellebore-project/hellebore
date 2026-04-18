<script lang="ts" generics="T">
    import type { BranchProps } from "./file-tree-interface";
    import FileTreeFolderNode from "./file-tree-folder-node.svelte";
    import FileTreeLeafNode from "./file-tree-leaf-node.svelte";

    const {
        service,
        node,
        depth = 0,
        folderLabel,
        leafLabel,
        nodeContextMenu,
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
                {#if service.isFolderNode(child)}
                    <FileTreeFolderNode
                        {service}
                        node={child}
                        {depth}
                        {folderLabel}
                        {leafLabel}
                        contextMenu={nodeContextMenu}
                    />
                {:else}
                    <FileTreeLeafNode
                        {service}
                        node={child}
                        {depth}
                        {leafLabel}
                        contextMenu={nodeContextMenu}
                    />
                {/if}
            </li>
        {/each}
    </ul>
</div>
