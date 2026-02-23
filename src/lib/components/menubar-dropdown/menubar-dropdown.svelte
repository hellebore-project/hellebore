<script lang="ts">
    import { Button, type ButtonProps } from "@/lib/components/button";
    import {
        DropdownMenu,
        DropdownMenuTrigger,
        DropdownMenuAutoContent,
    } from "@/lib/components/dropdown-menu";

    import type { MenuBarDropdownProps } from "./menubar-dropdown-interface";

    const {
        label,
        items,
        buttonProps,
        itemProps,
        contentProps,
    }: MenuBarDropdownProps = $props();

    let isOpen = $state(false);

    function _transformButtonProps(buttonProps?: ButtonProps) {
        let { size = "sm", class: className = "", ...rest } = buttonProps ?? {};

        if (isOpen)
            // button stays highlighted when the dropdown is open
            className += " bg-accent text-accent-foreground";

        return {
            class: className,
            size,
            ...rest,
        };
    }
</script>

<DropdownMenu bind:open={isOpen}>
    <DropdownMenuTrigger>
        <Button {..._transformButtonProps(buttonProps)}>
            {label}
        </Button>
    </DropdownMenuTrigger>

    <DropdownMenuAutoContent {items} {itemProps} {...contentProps} />
</DropdownMenu>
