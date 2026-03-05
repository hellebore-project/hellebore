<script lang="ts">
    import { cn } from "@/lib/utils.js";
    import { PillVariants } from "./pill-variants";
    import type { PillProps } from "./pill-interface";

    let {
        class: className,
        variant = "default",
        size = "md",
        ref = $bindable(null),
        children,
        ...restProps
    }: PillProps = $props();
</script>

<span
    bind:this={ref}
    data-slot="pill"
    class={cn(PillVariants({ variant, size }), className)}
    {...restProps}
>
    {@render children?.()}
</span>
