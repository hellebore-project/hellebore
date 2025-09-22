// mantine package styles must be imported before the application styles
import "@mantine/core/styles.css";
import "@mantine/tiptap/styles.css";
import "./client.css";

import { AppShell, MantineProvider } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { EntryCreator, ContextMenu, ProjectCreator } from "./overlays";
import { getService } from "./services";

import { Footer, Header, Center, LeftSideBar } from ".";

function renderPortalContainer() {
    const service = getService();
    return <div id={service.sharedPortalId} />;
}

export const PortalContainer = observer(renderPortalContainer);

function renderClient() {
    const service = getService();
    service.injectHooks();
    return (
        <MantineProvider
            defaultColorScheme={service.style.colorScheme}
            theme={service.style.theme}
        >
            <AppShell
                header={{ height: { base: service.headerHeight } }}
                navbar={{
                    width: service.navbarWidth,
                    breakpoint: "sm",
                    collapsed: {
                        desktop: !service.domain.hasProject,
                        mobile:
                            !service.navBarMobileOpen ||
                            !service.domain.hasProject,
                    },
                }}
                footer={{
                    height: service.footerHeight,
                }}
                padding={service.mainPadding}
            >
                <AppShell.Header className="header-panel">
                    <Header />
                </AppShell.Header>

                <AppShell.Navbar className="left-sidebar-panel">
                    <LeftSideBar />
                </AppShell.Navbar>

                <AppShell.Main className="main-panel">
                    <Center />
                </AppShell.Main>

                <AppShell.Footer className="footer-panel">
                    <Footer />
                </AppShell.Footer>
            </AppShell>

            <ProjectCreator />
            <EntryCreator />

            <ContextMenu />

            <PortalContainer />
        </MantineProvider>
    );
}

export const Client = observer(renderClient);
