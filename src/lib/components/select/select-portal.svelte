<script lang="ts">
    import { Select as SelectPrimitive } from "bits-ui";
    import { SHARED_PORTAL_SELECTOR } from "@/constants/client";

    let {
        to = SHARED_PORTAL_SELECTOR,
        ...restProps
    }: SelectPrimitive.PortalProps = $props();
</script>

<SelectPrimitive.Portal {to} {...restProps} />
