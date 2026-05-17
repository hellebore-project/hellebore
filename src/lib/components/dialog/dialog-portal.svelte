<script lang="ts">
    import { Dialog as DialogPrimitive } from "bits-ui";
    import { SHARED_PORTAL_SELECTOR } from "@/constants/client";

    let {
        to = SHARED_PORTAL_SELECTOR,
        ...restProps
    }: DialogPrimitive.PortalProps = $props();
</script>

<DialogPrimitive.Portal {to} {...restProps} />
