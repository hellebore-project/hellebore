<script lang="ts" generics="T">
    import { Input } from "@/lib/components/input";
    import * as Popover from "@/lib/components/popover";

    import type { EditableLabelProps } from "./file-tree-interface";

    const { service, node }: EditableLabelProps<T> = $props();

    let ref: HTMLInputElement | null = $state(null);
    let error = $derived(service.getNodeError(node.id));

    $effect(() => {
        if (!ref) return;
        ref.focus();
    });
</script>

<Popover.Root open={!!error}>
    <Popover.Trigger>
        {#snippet child({ props })}
            <!-- 
                The popover trigger injects a `type="button"` prop into its child by default.
                This messes with the input and causes it to be rendered as a read-only button.
                We override type with `text` to ensure the input is editable.
            -->
            <Input
                bind:ref
                {...props}
                type="text"
                class={"flex-1 min-w-0 h-auto py-0 border-0 px-0 shadow-none " +
                    "focus-visible:ring-0 focus-visible:border-0"}
                severity={error ? "error" : "normal"}
                value={node.text ?? ""}
                oninput={(e) =>
                    service.setNodeEditText(node.id, e.currentTarget.value)}
                onblur={() => service.commitNodeTextEdit(node.id)}
                onkeydown={(e) => service.handleKeydown(e, node)}
                onclick={(e) => e.stopPropagation()}
            />
        {/snippet}
    </Popover.Trigger>
    <Popover.Content
        side="bottom"
        align="start"
        class="w-auto px-2 py-1.5 text-sm text-error-foreground bg-popover"
    >
        {error}
    </Popover.Content>
</Popover.Root>
