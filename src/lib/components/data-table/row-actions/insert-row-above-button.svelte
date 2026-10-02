<script lang="ts" module>
    export interface InsertRowAboveButtonProps {
        onclick: () => void;
    }
</script>

<script lang="ts">
    import ArrowUpFromLineIcon from "@lucide/svelte/icons/arrow-up-from-line";

    import { Button } from "@/lib/components/button";
    import * as Tooltip from "@/lib/components/tooltip";

    const { onclick }: InsertRowAboveButtonProps = $props();
</script>

<Tooltip.Root>
    <Tooltip.Trigger>
        <Button
            class="invisible group-hover:visible"
            variant="ghost"
            size="icon-sm"
            aria-label="Insert Row Above"
            {onclick}
        >
            <ArrowUpFromLineIcon />
        </Button>
    </Tooltip.Trigger>
    <Tooltip.Content side="bottom">
        <Tooltip.Arrow />
        Insert Row Above
    </Tooltip.Content>
</Tooltip.Root>
