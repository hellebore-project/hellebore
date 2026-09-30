<script lang="ts" module>
    export interface DeleteRowButtonProps {
        onclick: () => void;
        deletable?: boolean;
    }
</script>

<script lang="ts">
    import Trash2Icon from "@lucide/svelte/icons/trash-2";

    import { cn } from "@/lib/utils";
    import { Button } from "@/lib/components/button";
    import * as Tooltip from "@/lib/components/tooltip";

    const { onclick, deletable = true }: DeleteRowButtonProps = $props();
</script>

<Tooltip.Root>
    <Tooltip.Trigger>
        <Button
            class={cn("invisible", deletable && "group-hover:visible")}
            variant="ghost"
            size="icon-sm"
            color="destructive"
            aria-label="Delete Row"
            {onclick}
        >
            <Trash2Icon />
        </Button>
    </Tooltip.Trigger>
    <Tooltip.Content side="bottom">
        <Tooltip.Arrow />
        Delete Row
    </Tooltip.Content>
</Tooltip.Root>
