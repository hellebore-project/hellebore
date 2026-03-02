<script lang="ts" generics="I extends MentionItemData">
    import { Button } from "@/lib/components/button";
    import { cn } from "@/lib/utils";

    import type { MentionItemData, MentionProps } from "./mention-interface";

    const { service }: MentionProps<I> = $props();
</script>

<div
    class="flex flex-col items-center p-1 gap-1 bg-popover text-popover-foreground rounded-md border shadow-md"
>
    {#each service.items as item, i (`${i}-${item.label}`)}
        <Button
            class={cn(
                "w-full",
                "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground dark:data-[selected=true]:bg-accent/50",
            )}
            data-selected={i === service.selectedIndex}
            variant="ghost"
            size="sm"
            onclick={() => service.select(item)}
            onmouseover={() => (service.selectedIndex = i)}
        >
            {item.label}
        </Button>
    {/each}
</div>
