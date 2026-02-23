<script lang="ts">
    import { cn } from "@/lib/utils.js";
    import { Combobox as ComboboxPrimitive } from "bits-ui";

    let {
        ref = $bindable(null),
        class: className,
        ...restProps
    }: ComboboxPrimitive.ScrollDownButtonProps = $props();
</script>

<ComboboxPrimitive.ScrollDownButton
    bind:ref
    data-slot="combobox-scroll-down-button"
    class={cn("flex w-full items-center justify-center py-1", className)}
    {...restProps}
/>
