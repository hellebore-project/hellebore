import { AppShell, MantineProvider } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { getService } from "@/client/services";

import {
    Footer,
    Header,
    Center,
    LeftSideBar,
    EntryCreator,
    ContextMenu,
    ProjectCreator,
} from ".";

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
                header={{ height: { base: service.header.height } }}
                navbar={{
                    width: service.navigation.width,
                    breakpoint: "sm",
                    collapsed: {
                        desktop: !service.domain.hasProject,
                        mobile:
                            !service.navigation.mobileOpen ||
                            !service.domain.hasProject,
                    },
                }}
                footer={{
                    height: service.footer.height,
                }}
                padding={service.centerPadding}
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
