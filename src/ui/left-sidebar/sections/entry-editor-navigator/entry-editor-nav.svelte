<script lang="ts">
    import * as Sidebar from "@/lib/components/sidebar";

    import type { EntryEditorNavigatorService } from "./entry-editor-nav-service.svelte";

    const { service }: { service: EntryEditorNavigatorService } = $props();
</script>

<Sidebar.SidebarMenu>
    {#each service.menuItems as item (item.value)}
        <Sidebar.SidebarMenuItem>
            <Sidebar.SidebarMenuButton
                class="ps-8"
                isActive={service.activeView === item.value}
                onclick={() => service.selectView(item.value)}
            >
                {item.label}
            </Sidebar.SidebarMenuButton>
        </Sidebar.SidebarMenuItem>
    {/each}
</Sidebar.SidebarMenu>
