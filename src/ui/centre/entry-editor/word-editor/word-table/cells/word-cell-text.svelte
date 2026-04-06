<script lang="ts">
    import { Input } from "@/lib/components/input";
    import type { WordKey } from "@/interface";

    import type { WordTableService } from "../word-table-service.svelte";
    import type { WordColumnKey } from "../word-table-constants";

    interface Props {
        rowKey: WordKey;
        colKey: WordColumnKey;
        value: string;
        service: WordTableService;
        onfocusgrid: () => void;
        selectAll?: boolean;
    }

    const {
        rowKey,
        colKey,
        value,
        service,
        onfocusgrid,
        selectAll = true,
    }: Props = $props();

    let ref: HTMLInputElement | null = $state(null);

    $effect(() => {
        if (ref) {
            ref.focus();
            if (selectAll) {
                ref.select();
            } else {
                ref.setSelectionRange(ref.value.length, ref.value.length);
            }
        }
    });
</script>

<Input
    bind:ref
    variant="ghost"
    shape="sharp"
    class="h-full w-full rounded-none px-2 py-2"
    {value}
    oninput={(e) => service.setValue(rowKey, colKey, e.currentTarget.value)}
    onkeydown={(e) => {
        service.handleKeyDown(e, rowKey, colKey);
        if (service.editCell === null) onfocusgrid();
    }}
/>
