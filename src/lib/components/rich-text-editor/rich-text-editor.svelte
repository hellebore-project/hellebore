<script lang="ts">
    import "./rich-text-editor.css";

    import { onMount } from "svelte";

    import type { RichTextEditorProps } from "./rich-text-editor-interface";
    import type { MentionItemData } from "./mention";

    const {
        service,
        rootProps,
        editorProps,
    }: RichTextEditorProps<MentionItemData> = $props();

    let element: HTMLDivElement | null = $state(null);

    onMount(() => {
        service.mount(element as HTMLDivElement, editorProps);
    });

    $effect(() => {
        // in cases where the service is swapped with another one
        // but the DOM element stays intact, we need to force a remount
        if (!service.mounted)
            service.mount(element as HTMLDivElement, editorProps);
    });
</script>

{#key service.key}
    <div id={service.key} bind:this={element} {...rootProps}></div>
{/key}
