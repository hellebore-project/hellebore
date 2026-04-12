<script lang="ts" generics="T">
    import { flip } from "svelte/animate";
    import { dndzone } from "svelte-dnd-action";

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

    let children = $derived(service.childrenOf(parentId));
</script>

<ul
    class="w-full list-none p-0 m-0"
    use:dndzone={{
        items: children,
        flipDurationMs: service.flipDurationMs,
        type: service.id,
    }}
    onconsider={(e) => service.handleConsider(parentId, e)}
    onfinalize={(e) => service.handleFinalize(parentId, e)}
>
    {#each children as node (service.shadowMarker(node) ? `${node.id}_${service.shadowMarker(node)}` : node.id)}
        <li
            class="list-none"
            animate:flip={{ duration: service.flipDurationMs }}
            data-is-dnd-shadow-item-hint={service.shadowMarker(node)}
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
