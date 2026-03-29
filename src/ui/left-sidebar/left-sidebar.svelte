<script lang="ts">
    import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";

    import { SidebarSectionType } from "@/constants";
    import {
        Collapsible,
        CollapsibleContent,
        CollapsibleTrigger,
    } from "@/lib/components/collapsible";
    import * as Sidebar from "@/lib/components/sidebar";

    import EntryEditorNavigator from "./sections/entry-editor-navigator/entry-editor-navigator.svelte";
    import type { EntryEditorNavigatorService } from "./sections/entry-editor-navigator/entry-editor-navigator-service.svelte";
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
        <Sidebar.SidebarContent>
            {#each service.iterateSections() as section (section.key)}
                <Sidebar.SidebarGroup>
                    <Collapsible bind:open={section.collapsed} class="w-full">
                        <CollapsibleTrigger
                            class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent focus-visible:ring-2 data-[state=open]:[&>svg]:rotate-180"
                        >
                            <ChevronDownIcon
                                class="size-4 shrink-0 transition-transform duration-200"
                            />
                            <span class="min-w-0 flex-1 truncate">
                                {section.title}
                            </span>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                            <Sidebar.SidebarGroupContent>
                                {#if section.type === SidebarSectionType.Spotlight}
                                    TODO
                                {:else if section.type === SidebarSectionType.EntryEditorNavigator}
                                    <EntryEditorNavigator
                                        service={section as EntryEditorNavigatorService}
                                    />
                                {/if}
                            </Sidebar.SidebarGroupContent>
                        </CollapsibleContent>
                    </Collapsible>
                </Sidebar.SidebarGroup>
            {/each}
        </Sidebar.SidebarContent>
    </Sidebar.Sidebar>
</Sidebar.SidebarProvider>
