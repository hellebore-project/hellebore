<script lang="ts">
    import { PropertyFieldType } from "@/constants";
    import { Card } from "@/lib/components/card";
    import type {
        TextPropertyFieldData,
        SelectPropertyFieldData,
    } from "@/interface";

    import type { PropertyTableProps } from "./property-table-interface";
    import { TextFieldRow, SelectFieldRow } from "./rows";

    const { service }: PropertyTableProps = $props();
</script>

{#if service.rows.length > 0}
    <Card>
        <div class="space-y-3 px-6">
            {#each service.rows as fieldData (fieldData.property)}
                {#if fieldData.type === PropertyFieldType.Text}
                    <TextFieldRow
                        fieldData={fieldData as TextPropertyFieldData}
                    />
                {:else if fieldData.type === PropertyFieldType.Select}
                    <SelectFieldRow
                        fieldData={fieldData as SelectPropertyFieldData}
                    />
                {/if}
            {/each}
        </div>
    </Card>
{/if}
