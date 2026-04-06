<script lang="ts">
    import { WordType } from "@/constants";
    import type { WordKey } from "@/interface";
    import * as Select from "@/lib/components/select";

    import { WORD_TYPE_ITEMS } from "../word-table-constants";
    import type { WordTableService } from "../word-table-service.svelte";

    interface Props {
        rowKey: WordKey;
        wordType: WordType;
        service: WordTableService;
        onfocusgrid: () => void;
    }

    const { rowKey, wordType, service, onfocusgrid }: Props = $props();

    let contentRef: HTMLElement | null = $state(null);

    $effect(() => {
        service.selectContentEl = contentRef;
        return () => {
            service.selectContentEl = null;
        };
    });
</script>

<Select.Root
    type="single"
    value={String(wordType)}
    onValueChange={(v) => {
        service.setWordType(rowKey, Number(v));
        onfocusgrid();
    }}
    onOpenChange={(open) => {
        if (!open && service.editCell !== null) onfocusgrid();
    }}
>
    <Select.Trigger
        size="sm"
        class="h-full w-full rounded-none border-none shadow-none"
    >
        <span class:text-muted-foreground={wordType === WordType.None}>
            {WORD_TYPE_ITEMS.find((i) => i.value === wordType)?.label ?? ""}
        </span>
    </Select.Trigger>
    <Select.Content bind:ref={contentRef}>
        {#each WORD_TYPE_ITEMS as item (item.value)}
            <Select.Item value={String(item.value)} label={item.label} />
        {/each}
    </Select.Content>
</Select.Root>
