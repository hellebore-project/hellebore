<script lang="ts">
    import "./rich-text-editor.css";

    import { onMount, onDestroy } from "svelte";

    import type { RichTextEditorProps } from "./rich-text-editor-interface";

    const { service, rootProps, editorProps }: RichTextEditorProps = $props();

    let element: HTMLDivElement | null = $state(null);

    onMount(() => {
        service.editor.mount(element as HTMLDivElement);
        service.editor.setOptions({ editorProps });
    });

    onDestroy(() => {
        service.editor.destroy();
    });
</script>

<div bind:this={element} {...rootProps}></div>
