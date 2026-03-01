<script lang="ts">
    import { cn } from "@/lib/utils.js";
    import { ButtonVariants } from "./button-variants";
    import type { ButtonProps } from "./button-interface";

    let {
        class: className,
        variant = "default",
        size = "default",
        ref = $bindable(null),
        href = undefined,
        type = "button",
        disabled,
        children,
        ...restProps
    }: ButtonProps = $props();
</script>

{#if href}
    <a
        bind:this={ref}
        data-slot="button"
        class={cn(ButtonVariants({ variant, size }), className)}
        href={disabled ? undefined : href}
        aria-disabled={disabled}
        role={disabled ? "link" : undefined}
        tabindex={disabled ? -1 : undefined}
        {...restProps}
    >
        {@render children?.()}
    </a>
{:else}
    <button
        bind:this={ref}
        data-slot="button"
        class={cn(ButtonVariants({ variant, size }), className)}
        {type}
        {disabled}
        {...restProps}
    >
        {@render children?.()}
    </button>
{/if}
