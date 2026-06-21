<script lang="ts">
    import * as Tooltip from "@/lib/components/tooltip";
    import { SHARED_PORTAL_ID } from "@/constants";

    let {
        Component,
        componentProps,
    }: { Component: any; componentProps: Record<string, any> } = $props();
</script>

<Tooltip.Provider>
    <Component {...componentProps} />
</Tooltip.Provider>

<div id={SHARED_PORTAL_ID}></div>
