<script lang="ts" generics="TColKey extends string">
    import { Input } from "@/lib/components/input";

    import type { DataTableService } from "../data-table-service.svelte";

    interface TextCellProps {
        rowKey: string;
        colKey: TColKey;
        value: string;
        service: DataTableService<TColKey>;
        oninput: (value: string) => void;
        selectAll?: boolean;
    }

    const {
        rowKey,
        colKey,
        value,
        service,
        oninput,
        selectAll = true,
    }: TextCellProps = $props();

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
    oninput={(e) => oninput(e.currentTarget.value)}
    onkeydown={(e) => {
        service.handleKeyDown(e, rowKey, colKey);
        if (service.editCell === null) service.focusGrid?.();
    }}
/>
