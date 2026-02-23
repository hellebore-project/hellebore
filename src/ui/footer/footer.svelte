<script lang="ts">
    import type { FooterProps } from './footer-interface';

	let { service }: FooterProps = $props();
</script>

<div class="flex items-center pl-2 h-[25px] bg-neutral-950">
	<p class="truncate text-xs">
		{service.text}
	</p>
</div>
