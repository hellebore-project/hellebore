<script lang="ts">
    import { Dialog as SheetPrimitive } from "bits-ui";

    import { SHARED_PORTAL_SELECTOR } from "@/constants";

    let {
        to = SHARED_PORTAL_SELECTOR,
        ...restProps
    }: SheetPrimitive.PortalProps = $props();
</script>

<SheetPrimitive.Portal {to} {...restProps} />
