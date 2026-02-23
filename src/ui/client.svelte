<script lang="ts">
	import "./client.css";

	import { TooltipProvider } from "@/lib/components/tooltip";

	import { ClientManager } from "./client-service.svelte";
	import { Header } from "./header";
	import { Footer } from "./footer";
	import { Centre } from "./centre";

	const service = new ClientManager();
</script>

<TooltipProvider>
	<div class="client h-screen">
		<div class="client-shell overflow-hidden w-full h-full gap-0">
			<header class="header-panel overflow-auto">
				<Header service={service.header} />
			</header>

			<aside class="left-sidebar-panel overflow-auto">
				<!-- LeftSidebar content -->
			</aside>

			<main class="central-panel flex flex-col overflow-auto p-(--central-padding)">
				<Centre service={service.central}/>
			</main>

			<footer class="footer-panel overflow-hidden">
				<Footer service={service.footer}/>
			</footer>
		</div>

		<div>
			<!-- Modals -->
		</div>

		<div>
			<!-- Context Menu -->
		</div>

		<div>
			<!-- Portal -->
		</div>
	</div>
</TooltipProvider>
