<script lang="ts">
    import { cn } from "@/lib/utils.js";
    import { Combobox as ComboboxPrimitive } from "bits-ui";

    let {
        ref = $bindable(null),
        class: className,
        ...restProps
    }: ComboboxPrimitive.InputProps = $props();
</script>

<ComboboxPrimitive.Input
    bind:ref
    data-slot="combobox-input"
    class={cn(
        "flex h-9 w-[296px] min-w-0 px-3 py-1 shadow-xs text-base md:text-sm",
        "border-input bg-background",
        "selection:bg-primary dark:bg-input/30 selection:text-primary-foreground",
        "ring-offset-background placeholder:text-muted-foreground",
        "rounded-md border transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 ",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
    )}
    {...restProps}
/>
