<script lang="ts">
    import TrashIcon from "@lucide/svelte/icons/trash";

    import * as Tooltip from "@/lib/components/tooltip";
    import { Button } from "@/lib/components/button";

    import type { DeleteEntryButtonProps } from "./delete-entry-button-interface";

    let { service }: DeleteEntryButtonProps = $props();
</script>

<Tooltip.Provider>
    <Tooltip.Root>
        <Tooltip.Trigger>
            <Button
                variant="outline"
                size="icon-sm"
                color="destructive"
                onclick={() => service.deleteEntry()}
            >
                <TrashIcon />
            </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
            <p>Delete entry</p>
        </Tooltip.Content>
    </Tooltip.Root>
</Tooltip.Provider>
