import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

import type { ButtonProps } from "@/lib/components/button";
import type { DropdownMenuItemData } from "@/lib/components/dropdown-menu";

export interface MenuBarDropdownProps {
    label: string;
    items: DropdownMenuItemData[];
    buttonProps?: ButtonProps;
    itemProps?: DropdownMenuPrimitive.ItemProps;
    contentProps?: DropdownMenuPrimitive.ContentProps;
}
