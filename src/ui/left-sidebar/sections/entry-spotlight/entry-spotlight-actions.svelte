<script lang="ts">
    import FolderPlusIcon from "@lucide/svelte/icons/folder-plus";
    import FoldVerticalIcon from "@lucide/svelte/icons/fold-vertical";

    import { Button } from "@/lib/components/button";
    import * as Tooltip from "@/lib/components/tooltip";

    import type { EntrySpotlightService } from "./entry-spotlight-service.svelte";

    interface Props {
        service: EntrySpotlightService;
        hover: boolean;
    }

    const { service, hover }: Props = $props();
</script>

{#if hover}
    <div class="flex items-center gap-0.5 pr-1">
        {#if service.canAddFolder}
            <Tooltip.Root>
                <Tooltip.Trigger>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onclick={() => service.addPlaceholderForNewFolder()}
                    >
                        <FolderPlusIcon class="size-4" />
                    </Button>
                </Tooltip.Trigger>
                <Tooltip.Content side="bottom">
                    <Tooltip.Arrow />
                    New Folder
                </Tooltip.Content>
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
                <Tooltip.Content side="bottom">
                    <Tooltip.Arrow />
                    Collapse All
                </Tooltip.Content>
            </Tooltip.Root>
        {/if}
    </div>
{/if}
