<script lang="ts">
    import ChevronFirstIcon from "@lucide/svelte/icons/chevron-first";
    import ChevronLastIcon from "@lucide/svelte/icons/chevron-last";
    import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
    import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";

    import { Button } from "@/lib/components/button";

    import type { PaginationProps } from "./pagination-interface";

    const { page, pageCount, onPageChange }: PaginationProps = $props();
</script>

<div class="flex items-center gap-1">
    <Button
        variant="ghost"
        size="icon-sm"
        disabled={page <= 1}
        onclick={() => onPageChange(1)}
    >
        <ChevronFirstIcon />
    </Button>
    <Button
        variant="ghost"
        size="icon-sm"
        disabled={page <= 1}
        onclick={() => onPageChange(page - 1)}
    >
        <ChevronLeftIcon />
    </Button>
    <span class="px-2 text-sm text-muted-foreground"
        >Page {page} of {pageCount}</span
    >
    <Button
        variant="ghost"
        size="icon-sm"
        disabled={page >= pageCount}
        onclick={() => onPageChange(page + 1)}
    >
        <ChevronRightIcon />
    </Button>
    <Button
        variant="ghost"
        size="icon-sm"
        disabled={page >= pageCount}
        onclick={() => onPageChange(pageCount)}
    >
        <ChevronLastIcon />
    </Button>
</div>
