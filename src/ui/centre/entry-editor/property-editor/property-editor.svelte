<script lang="ts">
    import { PropertyTable } from "./property-table";
    import type { PropertyEditorProps } from "./property-editor-interface";

    const { service }: PropertyEditorProps = $props();
</script>

<div class="property-editor">
    <div class="property-editor-stack space-y-4">
        <PropertyTable service={service.tableService} />
    </div>
</div>
