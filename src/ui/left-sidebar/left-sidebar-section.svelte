<script lang="ts">
    import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";

    import { SidebarSectionType } from "@/constants";
    import * as Collapsible from "@/lib/components/collapsible";
    import * as Sidebar from "@/lib/components/sidebar";
    import { cn } from "@/lib/utils";

    import EntryEditorNavigator from "./sections/entry-editor-navigator/entry-editor-nav.svelte";
    import type { EntryEditorNavigatorService } from "./sections/entry-editor-navigator/entry-editor-nav-service.svelte";
    import type { LeftSidebarSectionProps } from "./left-sidebar-interface";

    const { service }: LeftSidebarSectionProps = $props();
</script>

<Sidebar.SidebarGroup>
    <Collapsible.Root bind:open={service.open} class="w-full">
        <Collapsible.Trigger
            class={cn(
                "flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm font-medium",
                "text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent focus-visible:ring-2",
                "data-[state=open]:[&>svg]:rotate-90",
            )}
        >
            <ChevronRightIcon
                class="size-4 shrink-0 transition-transform duration-200"
            />
            <span class="flex-1 min-w-0 truncate font-bold">
                {service.title.toUpperCase()}
            </span>
        </Collapsible.Trigger>

        <Collapsible.Content>
            <Sidebar.SidebarGroupContent>
                {#if service.type === SidebarSectionType.Spotlight}
                    TODO
                {:else if service.type === SidebarSectionType.EntryEditorNavigator}
                    <EntryEditorNavigator
                        service={service as EntryEditorNavigatorService}
                    />
                {/if}
            </Sidebar.SidebarGroupContent>
        </Collapsible.Content>
    </Collapsible.Root>
</Sidebar.SidebarGroup>
