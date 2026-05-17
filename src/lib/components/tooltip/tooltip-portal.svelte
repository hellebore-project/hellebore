<script lang="ts">
    import { Tooltip as TooltipPrimitive } from "bits-ui";
    import { SHARED_PORTAL_SELECTOR } from "@/constants/client";

    let {
        to = SHARED_PORTAL_SELECTOR,
        ...restProps
    }: TooltipPrimitive.PortalProps = $props();
</script>

<TooltipPrimitive.Portal {to} {...restProps} />
