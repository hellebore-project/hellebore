<script lang="ts">
    import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
    import FolderIcon from "@lucide/svelte/icons/folder";
    import FolderOpenIcon from "@lucide/svelte/icons/folder-open";
    import FileIcon from "@lucide/svelte/icons/file";
    import { flip } from "svelte/animate";
    import {
        dndzone,
        type DndEvent,
        SHADOW_ITEM_MARKER_PROPERTY_NAME,
    } from "svelte-dnd-action";

    import { cn } from "@/lib/utils";

    import type { SpotlightNode } from "../entry-spotlight-service.svelte";
    import type { FileTreeProps } from "./file-tree-interface";
    import FileTree from "./file-tree.svelte";

    const FLIP_DURATION_MS = 200;

    const { service, parentId = "root", depth = 0 }: FileTreeProps = $props();

    let children = $derived(service.childrenOf(parentId));

    function handleConsider(e: CustomEvent<DndEvent<SpotlightNode>>) {
        service.setChildrenOf(parentId, e.detail.items);
    }

    async function handleFinalize(e: CustomEvent<DndEvent<SpotlightNode>>) {
        const movedItemId = e.detail.info.id as string;
        await service.finalizeMove(parentId, e.detail.items, movedItemId);
    }

    function handleKeydown(e: KeyboardEvent, node: SpotlightNode) {
        if (e.key === "Escape") {
            e.preventDefault();
            service.cancelFolderName(node);
        } else if (e.key === "Enter") {
            e.preventDefault();
            service.confirmFolderName(node);
        }
    }
</script>

<ul
    class="w-full list-none p-0 m-0"
    use:dndzone={{
        items: children,
        flipDurationMs: FLIP_DURATION_MS,
        type: "spotlight-tree",
    }}
    onconsider={handleConsider}
    onfinalize={handleFinalize}
>
    {#each children as node (node[SHADOW_ITEM_MARKER_PROPERTY_NAME] ? `${node.id}_${node[SHADOW_ITEM_MARKER_PROPERTY_NAME]}` : node.id)}
        <li
            class="list-none"
            animate:flip={{ duration: FLIP_DURATION_MS }}
            data-is-dnd-shadow-item-hint={node[
                SHADOW_ITEM_MARKER_PROPERTY_NAME
            ]}
        >
            {#if node.isFolder}
                <div
                    class={cn(
                        "flex items-center gap-1 px-1 py-0.5 cursor-pointer select-none",
                        "hover:bg-sidebar-accent rounded-sm text-sm text-sidebar-foreground",
                    )}
                    style="padding-left: {depth * 12 + 4}px"
                    role="button"
                    tabindex="0"
                    onclick={() => service.toggleCollapsed(node.id)}
                    onkeydown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            service.toggleCollapsed(node.id);
                        }
                    }}
                >
                    <ChevronRightIcon
                        class={cn(
                            "size-3.5 shrink-0 transition-transform duration-150",
                            !service.isCollapsed(node.id) && "rotate-90",
                        )}
                    />
                    {#if service.isCollapsed(node.id)}
                        <FolderIcon
                            class="size-3.5 shrink-0 text-muted-foreground"
                        />
                    {:else}
                        <FolderOpenIcon
                            class="size-3.5 shrink-0 text-muted-foreground"
                        />
                    {/if}

                    {#if node.isEditable}
                        <!-- svelte-ignore a11y_autofocus -->
                        <input
                            class="flex-1 min-w-0 bg-transparent border-b border-sidebar-foreground outline-none text-sm"
                            type="text"
                            autofocus
                            value={node.editableText ?? ""}
                            oninput={(e) =>
                                service.setFolderEditText(
                                    node.id,
                                    e.currentTarget.value,
                                )}
                            onblur={() => service.confirmFolderName(node)}
                            onkeydown={(e) => handleKeydown(e, node)}
                            onclick={(e) => e.stopPropagation()}
                        />
                    {:else}
                        <span class="flex-1 min-w-0 truncate">{node.text}</span>
                    {/if}
                </div>

                {#if !service.isCollapsed(node.id)}
                    <FileTree {service} parentId={node.id} depth={depth + 1} />
                {/if}
            {:else}
                <div
                    class={cn(
                        "flex items-center gap-1 px-1 py-0.5 cursor-pointer select-none",
                        "hover:bg-sidebar-accent rounded-sm text-sm text-sidebar-foreground",
                        node.rawId === service.displayedEntryId &&
                            "bg-sidebar-accent font-medium",
                    )}
                    style="padding-left: {depth * 12 + 20}px"
                    role="button"
                    tabindex="0"
                    onclick={() => service.selectEntry(node)}
                    onkeydown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            service.selectEntry(node);
                        }
                    }}
                >
                    <FileIcon class="size-3.5 shrink-0 text-muted-foreground" />
                    <span class="flex-1 min-w-0 truncate">{node.text}</span>
                </div>
            {/if}
        </li>
    {/each}
</ul>
