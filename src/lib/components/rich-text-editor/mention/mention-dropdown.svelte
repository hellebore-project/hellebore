<script lang="ts" generics="T">
    import { Button } from "@/lib/components/button";
    import { cn } from "@/lib/utils";

    import type { MentionProps } from "./mention-interface";

    const { service }: MentionProps<T> = $props();

    // TODO: tab index should be 0 for the currently-selected item, and -1 for all others,
    // so that the user can tab through the list and select an item with enter.
</script>

<div
    class="flex flex-col items-center p-1 gap-1 bg-popover text-popover-foreground rounded-md border shadow-md"
    role="menu"
>
    {#each service.items as item, i (`${i}-${item.label}`)}
        <Button
            class={cn(
                "w-full",
                "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground dark:data-[selected=true]:bg-accent/50",
            )}
            role="menuitem"
            data-selected={i === service.selectedIndex}
            variant="ghost"
            size="sm"
            onclick={() => service.select(item)}
            onmouseover={() => (service.selectedIndex = i)}
            onkeydown={(e) => {
                if (e.key === "Enter") {
                    e.stopPropagation();
                    service.select(item);
                }
            }}
        >
            {item.label}
        </Button>
    {/each}
</div>
