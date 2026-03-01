<script lang="ts">
    import { Menubar as MenubarPrimitive } from "bits-ui";

    import { cn } from "@/lib/utils.js";
    import { ButtonVariants, type ButtonProps } from "@/lib/components/button";

    let {
        ref = $bindable(null),
        class: className,
        variant,
        size,
        ...restProps
    }: MenubarPrimitive.TriggerProps & ButtonProps = $props();
</script>

<MenubarPrimitive.Trigger
    bind:ref
    data-slot="menubar-trigger"
    class={cn(
        "flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none",
        "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
        ButtonVariants({ variant, size }),
        className,
    )}
    {...restProps}
/>
