<script lang="ts">
    import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";

    import { SHARED_PORTAL_SELECTOR } from "@/constants";

    let {
        to = SHARED_PORTAL_SELECTOR,
        ...restProps
    }: DropdownMenuPrimitive.PortalProps = $props();
</script>

<DropdownMenuPrimitive.Portal {to} {...restProps} />
