<script lang="ts">
    import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";

    import { SidebarSectionType } from "@/constants";
    import * as Collapsible from "@/lib/components/collapsible";
    import * as Sidebar from "@/lib/components/sidebar";
    import { cn } from "@/lib/utils";

    import {
        EntryEditorNavigator,
        EntryEditorNavigatorService,
    } from "./sections/entry-editor-navigator";
    import {
        EntrySpotlight,
        EntrySpotlightActions,
        EntrySpotlightService,
    } from "./sections/entry-spotlight";
    import type { LeftSidebarSectionProps } from "./left-sidebar-interface";

    const { service }: LeftSidebarSectionProps = $props();

    let hover = $state(false);
</script>

<Sidebar.SidebarGroup
    class="py-1"
    onmouseenter={() => (hover = true)}
    onmouseleave={() => (hover = false)}
>
    <Collapsible.Root bind:open={service.open} class="w-full">
        <div class="flex w-full items-center" role="none">
            <Collapsible.Trigger
                class={cn(
                    "flex flex-1 items-center gap-2 px-2 py-1.5 text-left text-sm font-medium",
                    "text-sidebar-foreground outline-none ring-sidebar-ring focus-visible:ring-2",
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

            {#if service.type === SidebarSectionType.Spotlight}
                <EntrySpotlightActions
                    service={service as EntrySpotlightService}
                    {hover}
                />
            {/if}
        </div>

        <Collapsible.Content>
            <Sidebar.SidebarGroupContent>
                {#if service.type === SidebarSectionType.Spotlight}
                    <EntrySpotlight
                        service={service as EntrySpotlightService}
                    />
                {:else if service.type === SidebarSectionType.EntryEditorNavigator}
                    <EntryEditorNavigator
                        service={service as EntryEditorNavigatorService}
                    />
                {/if}
            </Sidebar.SidebarGroupContent>
        </Collapsible.Content>
    </Collapsible.Root>
</Sidebar.SidebarGroup>
