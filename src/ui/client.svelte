<script lang="ts">
    import "./client.css";

    import { SHARED_PORTAL_ID } from "@/constants/client";
    import * as Tooltip from "@/lib/components/tooltip";

    import { ClientManager } from "./client-service.svelte";
    import { Header } from "./header";
    import { Footer } from "./footer";
    import { Centre } from "./centre";
    import { LeftSidebar } from "./left-sidebar";
    import { Modal } from "./modal";

    const service = new ClientManager();
</script>

<Tooltip.Provider>
    <div class="client h-screen">
        <div class="client-shell overflow-hidden w-full h-full gap-0">
            <header class="header-panel overflow-auto">
                <Header service={service.header} />
            </header>

            <aside class="left-sidebar-panel overflow-hidden">
                <LeftSidebar service={service.leftSideBar} />
            </aside>

            <main
                class="central-panel flex flex-col overflow-auto p-(--central-padding)"
            >
                <Centre service={service.central} />
            </main>

            <footer class="footer-panel overflow-hidden">
                <Footer service={service.footer} />
            </footer>
        </div>

        <div>
            <Modal service={service.modal} />
        </div>

        <div id={SHARED_PORTAL_ID}></div>
    </div>
</Tooltip.Provider>
