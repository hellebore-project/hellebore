<script lang="ts">
    import CheckIcon from "@lucide/svelte/icons/check";
    import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";

    import * as Popover from "@/lib/components/popover";
    import { Pill } from "@/lib/components/pill";
    import { cn } from "@/lib/utils";

    import type { MultiSelectProps } from "./multi-select-interface";

    let {
        items,
        values,
        onValueChange,
        placeholder = "Select...",
        class: className,
    }: MultiSelectProps = $props();

    let open = $state(false);

    const selectedItems = $derived(
        items.filter((item) => values.includes(item.value)),
    );

    function toggle(value: string) {
        if (values.includes(value)) {
            onValueChange(values.filter((v) => v !== value));
        } else {
            onValueChange([...values, value]);
        }
    }
</script>

<Popover.Root bind:open>
    <Popover.Trigger
        class={cn(
            "flex min-h-9 w-full cursor-pointer flex-wrap items-center gap-1 rounded-md border border-input",
            "bg-background px-3 py-1.5 text-sm transition-colors",
            "hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none",
            "disabled:pointer-events-none disabled:opacity-50",
            className,
        )}
    >
        {#if selectedItems.length === 0}
            <span class="text-muted-foreground">{placeholder}</span>
        {:else}
            {#each selectedItems as item (item.value)}
                <Pill size="sm">{item.label}</Pill>
            {/each}
        {/if}
        <ChevronDownIcon class="ml-auto size-4 shrink-0 opacity-50" />
    </Popover.Trigger>
    <Popover.Content align="start" class="w-auto min-w-48 p-1">
        {#each items as item (item.value)}
            <button
                type="button"
                class={"flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm " +
                    "transition-colors hover:bg-accent hover:text-accent-foreground"}
                onclick={() => toggle(item.value)}
            >
                <span class="flex size-4 items-center justify-center">
                    {#if values.includes(item.value)}
                        <CheckIcon class="size-3.5" />
                    {/if}
                </span>
                {item.label}
            </button>
        {/each}
    </Popover.Content>
</Popover.Root>
