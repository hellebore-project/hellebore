<script lang="ts">
    import SearchIcon from "@lucide/svelte/icons/search";
    import ChevronsUpIcon from "@lucide/svelte/icons/chevrons-up";
    import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
    import ChevronsDownIcon from "@lucide/svelte/icons/chevrons-down";

    import {
        Combobox,
        ComboboxInput,
        ComboboxTrigger,
        ComboboxPortal,
        ComboboxContent,
        ComboboxScrollUpButton,
        ComboboxViewport,
        ComboboxItem,
        ComboboxScrollDownButton,
    } from "@/lib/components/combobox";

    import type { EntrySearchProps } from "./entry-search-interface";

    const { service, ...rest }: EntrySearchProps = $props();
</script>

<Combobox
    type="single"
    bind:value={service.queryString}
    onOpenChangeComplete={(o) => {
        if (!o) service.queryString = "";
    }}
    onValueChange={(v) => service.selectEntry(v)}
    {...rest}
>
    <div class="relative">
        <SearchIcon
            class="text-muted-foreground absolute start-2 top-1/2 size-6 -translate-y-1/2"
        />
        <!-- input can't be inside the trigger, otherwise you lose text selection -->
        <ComboboxInput
            class="ps-10 pe-7"
            clearOnDeselect
            oninput={(e) => (service.queryString = e.currentTarget.value)}
        />
        <ComboboxTrigger
            class="absolute end-1 top-1/2 size-6 -translate-y-1/2 touch-none"
        >
            <ChevronsUpDownIcon class="text-muted-foreground size-6" />
        </ComboboxTrigger>
    </div>

    <ComboboxPortal>
        <ComboboxContent>
            <ComboboxScrollUpButton
                class="flex w-full items-center justify-center py-1"
            >
                <ChevronsUpIcon class="size-3" />
            </ComboboxScrollUpButton>

            <ComboboxViewport>
                {#each service.queryResults as item, i (`${i}-${item.value}`)}
                    <ComboboxItem value={`${item.value}`} label={item.label}>
                        {item.label}
                    </ComboboxItem>
                {:else}
                    <span class="block px-5 py-2 text-sm text-muted-foreground">
                        No entries found
                    </span>
                {/each}
            </ComboboxViewport>

            <ComboboxScrollDownButton
                class="flex w-full items-center justify-center py-1"
            >
                <ChevronsDownIcon class="size-3" />
            </ComboboxScrollDownButton>
        </ComboboxContent>
    </ComboboxPortal>
</Combobox>
