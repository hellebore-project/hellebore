<script lang="ts" generics="M">
    import "./rich-text-editor.css";

    import { onMount } from "svelte";

    import type { RichTextEditorProps } from "./rich-text-editor-interface";
    import { cn } from "@/lib/utils";

    const { service, rootProps, editorProps }: RichTextEditorProps<M> =
        $props();
    let { class: className, ...rest } = $derived(rootProps ?? {});

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

{#key service.id}
    <div
        id={service.id}
        class={cn("rich-text-editor", className)}
        bind:this={element}
        {...rest}
    ></div>
{/key}
