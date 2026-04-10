<script lang="ts">
    import Trash2Icon from "@lucide/svelte/icons/trash-2";

    import { cn } from "@/lib/utils";
    import { Button } from "@/lib/components/button";

    interface Props {
        onclick: () => void;
        deleteable?: boolean;
    }

    const { onclick, deleteable = false }: Props = $props();
</script>

<Button
    class={cn("invisible", deleteable && "group-hover:visible")}
    variant="ghost"
    size="icon-sm"
    color="destructive"
    {onclick}
>
    <Trash2Icon />
</Button>
