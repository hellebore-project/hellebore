<script lang="ts">
    import "./rich-text-editor.css";

    import { onMount } from "svelte";

    import type { RichTextEditorProps } from "./rich-text-editor-interface";

    const { service, rootProps, editorProps }: RichTextEditorProps = $props();

    let element: HTMLDivElement | null = $state(null);

    onMount(() => {
        service.editor?.mount(element as HTMLDivElement);
        service.editor?.setOptions({ editorProps });
    });
</script>

<div bind:this={element} {...rootProps}></div>
