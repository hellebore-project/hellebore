<script lang="ts">
    import CircleAlertIcon from "@lucide/svelte/icons/circle-alert";

    import * as Tooltip from "@/lib/components/tooltip";
    import { Input, type InputSeverity } from "@/lib/components/input";
    import { Separator } from "@/lib/components/separator";

    import type { EntryTitleProps } from "./title-interface";

    let { service }: EntryTitleProps = $props();

    let error = $derived.by(() => {
        if (!service) return null;
        if (service.title === "") return "Empty title";
        if (!service.isTitleUnique) return "Duplicate title";
        return null;
    });
    let severity: InputSeverity = $derived(error ? "error" : undefined);

    let isOpen = $derived(error !== null);

    function getOpen() {
        return isOpen;
    }

    function setOpen() {
        isOpen = error !== null;
    }
</script>

{#if service}
    <div class="h-(--title-field-height)">
        <Tooltip.Provider
            delayDuration={0}
            skipDelayDuration={0}
            disableCloseOnTriggerClick
        >
            <Tooltip.Root
                bind:open={getOpen, setOpen}
                disableCloseOnTriggerClick
            >
                <Tooltip.Trigger class="w-full">
                    <Input
                        class="pb-2"
                        variant="ghost"
                        size="h2"
                        shape="round"
                        {severity}
                        placeholder="Title"
                        value={service.title}
                        oninput={(e) => (service.title = e.currentTarget.value)}
                    />
                </Tooltip.Trigger>

                <Tooltip.Content
                    class="flex items-start w-full px-3 py-2 gap-2 bg-error text-white"
                    side="bottom"
                >
                    <Tooltip.Arrow class="bg-error" />
                    <CircleAlertIcon class="h-5 w-5 shrink-0" />
                    <span class="text-sm">{error}</span>
                </Tooltip.Content>
            </Tooltip.Root>
        </Tooltip.Provider>

        <Separator class="my-3 border" />
    </div>
{/if}
