<script lang="ts">
    import { Input } from "@/lib/components/input";
    import { Label } from "@/lib/components/label";
    import type { TextPropertyFieldData } from "@/interface";

    interface TextFieldRowProps {
        fieldData: TextPropertyFieldData;
    }

    const { fieldData }: TextFieldRowProps = $props();
</script>

<div class="grid grid-cols-12 items-center gap-2">
    <Label class="col-span-3 text-sm font-medium">{fieldData.label}</Label>
    <div class="col-span-9">
        <Input
            type="text"
            variant="ghost"
            placeholder={fieldData.label}
            value={fieldData.getValue()}
            oninput={(e) => fieldData.setValue(e.currentTarget.value)}
            class="border-b px-0 py-1 focus:border-blue-500"
        />
    </div>
</div>
