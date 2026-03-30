<script lang="ts">
    import * as Sidebar from "@/lib/components/sidebar";

    import type { LeftSidebarProps } from "./left-sidebar-interface";
    import LeftSidebarSection from "./left-sidebar-section.svelte";

    const { service }: LeftSidebarProps = $props();
</script>

<Sidebar.SidebarProvider
    class="w-full min-h-0 h-full max-h-full overflow-hidden"
>
    <Sidebar.Sidebar
        class="w-full min-h-0 h-full max-h-full overflow-hidden"
        collapsible="none"
    >
        <Sidebar.SidebarContent>
            {#each service.iterateSections() as section (section.key)}
                <LeftSidebarSection service={section} />
            {/each}
        </Sidebar.SidebarContent>
    </Sidebar.Sidebar>
</Sidebar.SidebarProvider>
