<script lang="ts">
    import * as Select from "@/lib/components/select";
    import { Label } from "@/lib/components/label";
    import type { SelectPropertyFieldData } from "@/interface";

    interface SelectFieldRowProps {
        fieldData: SelectPropertyFieldData;
    }

    const { fieldData }: SelectFieldRowProps = $props();

    let value = $derived(fieldData.getValue());
</script>

<div class="grid grid-cols-12 items-center gap-2">
    <Label class="col-span-3 text-sm font-medium">{fieldData.label}</Label>
    <div class="col-span-9">
        <Select.Root
            type="single"
            {value}
            onValueChange={(v) => fieldData.setValue(v)}
        >
            <Select.Trigger
                class="border-b border-neutral-300 px-0 py-1 focus:border-blue-500"
            >
                <span class:text-muted-foreground={!value}
                    >{value || fieldData.label}</span
                >
            </Select.Trigger>
            <Select.Content>
                {#each fieldData.options ?? [] as option (option.value)}
                    <Select.Item value={option.value}
                        >{option.label}</Select.Item
                    >
                {/each}
            </Select.Content>
        </Select.Root>
    </div>
</div>
