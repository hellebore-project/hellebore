<script lang="ts">
	import "./client.css";
	import { ClientManager } from "./client.service";
	import Footer from "./footer/footer.svelte";

	const service = new ClientManager();
</script>

<div class="client-shell">
	<header class="header-panel">
		<!-- Header content -->
	</header>

	<aside class="left-sidebar-panel">
		<!-- LeftSidebar content -->
	</aside>

	<main class="main-panel">
		<!-- Center content -->
	</main>

	<footer class="footer-panel">
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