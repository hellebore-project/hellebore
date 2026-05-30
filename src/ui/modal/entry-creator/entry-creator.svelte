<script lang="ts">
    import { FILE_ENTITY_TYPES, ENTITY_TYPE_LABELS } from "@/api";
    import { Button } from "@/lib/components/button";
    import * as Dialog from "@/lib/components/dialog";
    import { Input } from "@/lib/components/input";
    import { Label } from "@/lib/components/label";
    import * as Select from "@/lib/components/select";
    import { compareStrings } from "@/utils/string";

    import type { EntryCreatorProps } from "./entry-creator-interface";

    const { service }: EntryCreatorProps = $props();

    const entityTypeOptions = FILE_ENTITY_TYPES.map((entityType) => ({
        value: entityType,
        label: ENTITY_TYPE_LABELS[entityType],
    })).sort((a, b) => compareStrings(a.label, b.label));

    let entityTypeValue = $derived(service.entryType?.toString() ?? "");

    function onTitleInput(event: Event) {
        service.entryTitle = (event.currentTarget as HTMLInputElement).value;
    }

    function onEntityTypeChange(value: string) {
        service.entryType = value === "" ? null : Number(value);
    }

    async function onSubmit(event: Event) {
        event.preventDefault();
        await service.submit();
    }
</script>

<form class="grid gap-4" onsubmit={onSubmit}>
    <div class="grid gap-2">
        <Label for="entry-entity-type">Entity</Label>
        <Select.Root
            type="single"
            value={entityTypeValue}
            onValueChange={onEntityTypeChange}
        >
            <Select.Trigger id="entry-entity-type" class="w-full">
                {service.entryType
                    ? ENTITY_TYPE_LABELS[service.entryType]
                    : "Select an entity type"}
            </Select.Trigger>
            <Select.Content>
                {#each entityTypeOptions as option (option.value)}
                    <Select.Item
                        value={option.value.toString()}
                        label={option.label}
                    />
                {/each}
            </Select.Content>
        </Select.Root>
    </div>

    <div class="grid gap-2">
        <Label for="entry-title">Title</Label>
        <Input
            id="entry-title"
            placeholder="Enter a unique title"
            value={service.entryTitle}
            oninput={onTitleInput}
            severity={service.isTitleUnique ? "normal" : "error"}
        />
        {#if !service.isTitleUnique}
            <p class="text-destructive text-sm">Duplicate title</p>
        {/if}
    </div>

    <Dialog.DialogFooter>
        <Button type="submit">Submit</Button>
    </Dialog.DialogFooter>
</form>
