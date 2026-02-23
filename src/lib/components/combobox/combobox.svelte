<script lang="ts">
    import { Combobox as ComboboxPrimitive } from "bits-ui";

    let {
        value = $bindable(undefined),
        open = $bindable(false),
        ...restProps
    }: ComboboxPrimitive.RootProps = $props();
</script>

{/* @ts-expect-error: typescript isn't correctly resolving the type of `value` */ null}
<ComboboxPrimitive.Root bind:value bind:open {...restProps} />
