<script lang="ts">
    import * as Sidebar from "@/lib/components/sidebar";

    import type { EntryEditorNavigatorService } from "./entry-editor-navigator-service.svelte";

    const { service }: { service: EntryEditorNavigatorService } = $props();
</script>

<Sidebar.SidebarMenu class="gap-0.5">
    {#each service.menuItems as item (item.value)}
        <Sidebar.SidebarMenuItem>
            <Sidebar.SidebarMenuButton
                isActive={service.activeView === item.value}
                onclick={() => service.selectView(item.value)}
            >
                <span>{item.label}</span>
            </Sidebar.SidebarMenuButton>
        </Sidebar.SidebarMenuItem>
    {/each}
</Sidebar.SidebarMenu>
