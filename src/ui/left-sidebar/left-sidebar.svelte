<script lang="ts">
    import * as Sidebar from "@/lib/components/sidebar";

    import type { LeftSidebarService } from "./left-sidebar-service.svelte";

    const { service }: { service: LeftSidebarService } = $props();
</script>

<Sidebar.SidebarProvider
    class="w-full min-h-0 h-full max-h-full overflow-hidden"
>
    <Sidebar.Sidebar
        class="w-full min-h-0 h-full max-h-full overflow-hidden"
        collapsible="none"
    >
        {service.key}
    </Sidebar.Sidebar>
</Sidebar.SidebarProvider>
