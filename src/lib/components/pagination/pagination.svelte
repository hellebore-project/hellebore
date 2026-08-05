<script lang="ts">
    import ChevronFirstIcon from "@lucide/svelte/icons/chevron-first";
    import ChevronLastIcon from "@lucide/svelte/icons/chevron-last";
    import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
    import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";

    import { Button } from "@/lib/components/button";
    import * as Tooltip from "@/lib/components/tooltip";

    import type { PaginationProps } from "./pagination-interface";

    const { service }: PaginationProps = $props();
</script>

<div class="flex items-center gap-1">
    <Tooltip.Root>
        <Tooltip.Trigger>
            <Button
                variant="ghost"
                size="icon-sm"
                disabled={service.isFirstPage}
                onclick={() => service.goToFirstPage()}
                aria-label="First Page"
            >
                <ChevronFirstIcon />
            </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
            <Tooltip.Arrow />
            First Page
        </Tooltip.Content>
    </Tooltip.Root>

    <Tooltip.Root>
        <Tooltip.Trigger>
            <Button
                variant="ghost"
                size="icon-sm"
                disabled={service.isFirstPage}
                onclick={() => service.goToPreviousPage()}
                aria-label="Previous Page"
            >
                <ChevronLeftIcon />
            </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
            <Tooltip.Arrow />
            Previous Page
        </Tooltip.Content>
    </Tooltip.Root>

    <span class="px-2 text-sm text-muted-foreground"
        >Page {service.page + 1} of {service.count}</span
    >

    <Tooltip.Root>
        <Tooltip.Trigger>
            <Button
                variant="ghost"
                size="icon-sm"
                disabled={service.isLastPage}
                onclick={() => service.goToNextPage()}
                aria-label="Next Page"
            >
                <ChevronRightIcon />
            </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
            <Tooltip.Arrow />
            Next Page
        </Tooltip.Content>
    </Tooltip.Root>

    <Tooltip.Root>
        <Tooltip.Trigger>
            <Button
                variant="ghost"
                size="icon-sm"
                disabled={service.isLastPage}
                onclick={() => service.goToLastPage()}
                aria-label="Last Page"
            >
                <ChevronLastIcon />
            </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
            <Tooltip.Arrow />
            Last Page
        </Tooltip.Content>
    </Tooltip.Root>
</div>
