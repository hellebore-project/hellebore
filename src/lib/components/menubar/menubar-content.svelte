<script lang="ts">
    import { Menubar as MenubarPrimitive } from "bits-ui";
    import MenubarPortal from "./menubar-portal.svelte";
    import { cn, type WithoutChildrenOrChild } from "@/lib/utils.js";
    import type { ComponentProps } from "svelte";

    let {
        ref = $bindable(null),
        class: className,
        sideOffset = 8,
        alignOffset = -4,
        align = "start",
        side = "bottom",
        portalProps,
        ...restProps
    }: MenubarPrimitive.ContentProps & {
        portalProps?: WithoutChildrenOrChild<
            ComponentProps<typeof MenubarPortal>
        >;
    } = $props();
</script>

<MenubarPortal {...portalProps}>
    <MenubarPrimitive.Content
        bind:ref
        data-slot="menubar-content"
        {sideOffset}
        {align}
        {alignOffset}
        {side}
        class={cn(
            "min-w-[12rem] z-50 p-1 origin-(--bits-menubar-content-transform-origin) overflow-hidden",
            "bg-popover text-popover-foreground rounded-md border shadow-md",
            "data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-end-2 data-[side=right]:slide-in-from-start-2 data-[side=top]:slide-in-from-bottom-2",
            className,
        )}
        {...restProps}
    />
</MenubarPortal>
