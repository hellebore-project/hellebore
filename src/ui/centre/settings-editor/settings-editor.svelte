<script lang="ts">
    import type { SettingsEditorProps } from "./settings-editor-interface";

    let { service }: SettingsEditorProps = $props();
</script>

<div class="flex flex-row justify-center py-6">
    <div class="w-2/3">
        <h1 class="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Settings
        </h1>
        <hr class="mt-3 border-border" />
        {service.key}
    </div>
</div>
