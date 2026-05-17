<script lang="ts">
    import { Combobox as ComboboxPrimitive } from "bits-ui";
    import { SHARED_PORTAL_SELECTOR } from "@/constants/client";

    let {
        to = SHARED_PORTAL_SELECTOR,
        ...restProps
    }: ComboboxPrimitive.PortalProps = $props();
</script>

<ComboboxPrimitive.Portal {to} {...restProps} />
