<script lang="ts">
    import { ContextMenu as ContextMenuPrimitive } from "bits-ui";
    import { SHARED_PORTAL_SELECTOR } from "@/constants/client";

    let {
        to = SHARED_PORTAL_SELECTOR,
        ...restProps
    }: ContextMenuPrimitive.PortalProps = $props();
</script>

<ContextMenuPrimitive.Portal {to} {...restProps} />
