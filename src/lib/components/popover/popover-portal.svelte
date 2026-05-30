<script lang="ts">
    import { Popover as PopoverPrimitive } from "bits-ui";

    import { SHARED_PORTAL_SELECTOR } from "@/constants";

    let {
        to = SHARED_PORTAL_SELECTOR,
        ...restProps
    }: PopoverPrimitive.PortalProps = $props();
</script>

<PopoverPrimitive.Portal {to} {...restProps} />
