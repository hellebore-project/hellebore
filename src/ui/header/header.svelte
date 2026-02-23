<script lang="ts">
    import { Button } from "@/lib/components/button";
    import { MenuBarDropdown } from "@/lib/components/menubar-dropdown";

    import { EntrySearchField } from "../shared/entry-search";
    import type { HeaderProps } from "./header-interface";

    const { service }: HeaderProps = $props();
</script>

<div
    class="flex items-center w-full h-(--header-height) gap-0 px-3 bg-neutral-700"
>
    <Button
        class="h-8"
        variant="ghost"
        size="sm"
        onclick={() => service.onOpenHome.produce()}
    >
        Home
    </Button>

    <MenuBarDropdown
        label="File"
        items={service.fileMenuData}
        buttonProps={{ class: "h-8", variant: "ghost" }}
        itemProps={{ class: "hover:bg-neutral-800" }}
        contentProps={{ align: "start" }}
    />

    <div class="flex-1"></div>

    <div class="">
        <EntrySearchField service={service.entrySearch} />
    </div>
</div>
