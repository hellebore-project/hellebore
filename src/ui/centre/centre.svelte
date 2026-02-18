<script lang="ts">
    import { CentralViewType } from "@/constants";
    import type { CentreProps } from "./centre.interface";
    import { Home, HomeManager } from "./home";

    let { service }: CentreProps = $props();
    let contentService = $derived(service.activePanelService);
</script>

{#if contentService !== null}
    {#if contentService.type === CentralViewType.Home}
        <Home service={contentService as HomeManager}/>
    {:else if contentService.type === CentralViewType.Settings}
        {null}
    {:else if contentService.type === CentralViewType.EntryEditor}
        {null}
    {:else}
        {null}
    {/if}
{/if}