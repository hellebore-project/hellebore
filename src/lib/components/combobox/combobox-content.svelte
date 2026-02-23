<script lang="ts">
    import { cn } from "@/lib/utils.js";
    import { Combobox as ComboboxPrimitive } from "bits-ui";

    let {
        ref = $bindable(null),
        sideOffset = 10,
        class: className,
        ...restProps
    }: ComboboxPrimitive.ContentProps = $props();
</script>

<ComboboxPrimitive.Content
    bind:ref
    data-slot="combobox-content"
    {sideOffset}
    class={cn(
        "focus-override border-muted bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 outline-hidden z-50 h-96 max-h-[var(--bits-combobox-content-available-height)] w-[var(--bits-combobox-anchor-width)] min-w-[var(--bits-combobox-anchor-width)] select-none rounded-xl border px-1 py-3 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className,
    )}
    {...restProps}
/>
