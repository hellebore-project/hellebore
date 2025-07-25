// mantine package styles must be imported before the application styles
import "@mantine/core/styles.css";
import "@mantine/tiptap/styles.css";
import "./app.css";

import { AppShell, MantineProvider } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { Footer, Header, Center, LeftSideBar } from "./panels";
import { ArticleCreator, ContextMenu, ProjectCreator } from "./overlays";
import { getService } from "./services";

function renderPortalContainer() {
    const service = getService();
    return <div id={service.view.sharedPortalId} />;
}

export const PortalContainer = observer(renderPortalContainer);

function renderApp() {
    const service = getService();
    service.view.injectHooks();
    return (
        <MantineProvider
            defaultColorScheme={service.view.style.colorScheme}
            theme={service.view.style.theme}
        >
            <AppShell
                header={{ height: { base: service.view.headerHeight } }}
                navbar={{
                    width: service.view.navbarWidth,
                    breakpoint: "sm",
                    collapsed: {
                        desktop: !service.domain.hasProject,
                        mobile:
                            !service.view.navBarMobileOpen ||
                            !service.domain.hasProject,
                    },
                }}
                footer={{
                    height: service.view.footerHeight,
                }}
                padding={service.view.mainPadding}
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
            <ArticleCreator />

            <ContextMenu />

            <PortalContainer />
        </MantineProvider>
    );
}

export const App = observer(renderApp);
