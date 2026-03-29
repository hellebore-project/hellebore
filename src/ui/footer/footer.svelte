<script lang="ts">
    import type { FooterProps } from "./footer-interface";

    let { service }: FooterProps = $props();
</script>

<!-- TODO: change the footer background colour based on whether there are any warnings or errors -->
<div class="flex items-center pl-2 h-[25px] bg-emerald-950">
    <p class="truncate text-xs">
        {service.text}
    </p>
</div>
