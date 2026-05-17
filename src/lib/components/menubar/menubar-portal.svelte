<script lang="ts">
    import { Menubar as MenubarPrimitive } from "bits-ui";
    import { SHARED_PORTAL_SELECTOR } from "@/constants/client";

    let {
        to = SHARED_PORTAL_SELECTOR,
        ...restProps
    }: MenubarPrimitive.PortalProps = $props();
</script>

<MenubarPrimitive.Portal {to} {...restProps} />
