<script lang="ts">
    import { CentralViewType } from "@/constants";
    import type { CentreProps } from "./centre-interface";
    import { Home, HomeManager } from "./home";
    import { SettingsEditor, SettingsEditorService } from "./settings-editor";
    import { EntryEditor, EntryEditorService } from "./entry-editor";

    let { service }: CentreProps = $props();
    let contentService = $derived(service.activePanelService);
</script>

{#if contentService !== null}
    {#if contentService.type === CentralViewType.Home}
        <Home service={contentService as HomeManager}/>
    {:else if contentService.type === CentralViewType.Settings}
        <SettingsEditor service={contentService as SettingsEditorService}/>
    {:else if contentService.type === CentralViewType.EntryEditor}
        <EntryEditor service={contentService as EntryEditorService}/>
    {:else}
        {null}
    {/if}
{/if}