<script lang="ts">
    import { Input } from "@/lib/components/input";

    import type { TextCellProps } from "../data-table-interface";

    const { value, oninput, selectAll = true }: TextCellProps = $props();

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
/>
