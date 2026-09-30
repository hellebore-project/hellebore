<script lang="ts" module>
    export interface InsertRowBelowButtonProps {
        onclick: () => void;
    }
</script>

<script lang="ts">
    import ArrowDownFromLineIcon from "@lucide/svelte/icons/arrow-down-from-line";

    import { Button } from "@/lib/components/button";
    import * as Tooltip from "@/lib/components/tooltip";

    const { onclick }: InsertRowBelowButtonProps = $props();
</script>

<Tooltip.Root>
    <Tooltip.Trigger>
        <Button
            class="invisible group-hover:visible"
            variant="ghost"
            size="icon-sm"
            aria-label="Insert Row Below"
            {onclick}
        >
            <ArrowDownFromLineIcon />
        </Button>
    </Tooltip.Trigger>
    <Tooltip.Content side="bottom">
        <Tooltip.Arrow />
        Insert Row Below
    </Tooltip.Content>
</Tooltip.Root>
