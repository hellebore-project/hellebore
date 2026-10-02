<script lang="ts" module>
    export interface AddRowButtonProps {
        onclick: () => void;
    }
</script>

<script lang="ts">
    import PlusIcon from "@lucide/svelte/icons/plus";
    import { Button } from "@/lib/components/button";

    const { onclick }: AddRowButtonProps = $props();
</script>

<Button variant="outline" {onclick}>
    <PlusIcon />
    Add Row
</Button>
