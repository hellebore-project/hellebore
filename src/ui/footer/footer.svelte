<script lang="ts">
	import { FooterManager } from './footer.service.svelte';

	interface Props {
		service: FooterManager;
	}

	let { service }: Props = $props();
</script>

<div class="flex items-center pl-2 h-[25px] bg-neutral-950">
	<p class="truncate text-xs">
		{service.text}
	</p>
</div>
