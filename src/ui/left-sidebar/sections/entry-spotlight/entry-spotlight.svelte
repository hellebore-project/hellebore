<script lang="ts">
    import FolderPlusIcon from "@lucide/svelte/icons/folder-plus";
    import FoldVerticalIcon from "@lucide/svelte/icons/fold-vertical";

    import { Button } from "@/lib/components/button";
    import * as Tooltip from "@/lib/components/tooltip";

    import type { EntrySpotlightProps } from "./entry-spotlight-interface";
    import { FileTree } from "./file-tree";

    const { service }: EntrySpotlightProps = $props();

    $effect(() => {
        const handlePointerDown = (e: PointerEvent) => {
            if (
                service.focused &&
                !(e.target as Element).closest("[data-spotlight]")
            ) {
                service.focused = false;
            }
        };
        document.addEventListener("pointerdown", handlePointerDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
        };
    });
</script>

<div
    class="flex flex-col h-full"
    data-spotlight
    onmouseenter={() => (service.hover = true)}
    onmouseleave={() => (service.hover = false)}
    role="tree"
>
    <div class="flex items-center justify-end gap-0.5 px-2 pb-1 min-h-[24px]">
        {#if service.canAddFolder}
            <Tooltip.Root>
                <Tooltip.Trigger>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onclick={() => service.addFolder()}
                    >
                        <FolderPlusIcon class="size-4" />
                    </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>New Folder</Tooltip.Content>
            </Tooltip.Root>
        {/if}

        {#if service.canCollapseAll}
            <Tooltip.Root>
                <Tooltip.Trigger>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onclick={() => service.collapseAll()}
                    >
                        <FoldVerticalIcon class="size-4" />
                    </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>Collapse All</Tooltip.Content>
            </Tooltip.Root>
        {/if}
    </div>

    <div class="flex-1 overflow-y-auto px-1">
        <FileTree {service} />
    </div>
</div>
