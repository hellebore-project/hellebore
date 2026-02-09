<script lang="ts">
	import "./client.css";
	import { ClientManager } from "./client.service";

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
		{service.key}
	</main>

	<footer class="footer-panel">
		<!-- Footer content -->
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