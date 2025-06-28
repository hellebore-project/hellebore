// mantine package styles must be imported before the application styles
import "@mantine/core/styles.css";
import "@mantine/tiptap/styles.css";
import "./shell.css";

import { AppShell, MantineProvider } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { Footer, Header, Center, LeftSideBar } from "./panels";
import { ArticleCreator, ContextMenu, ProjectCreator } from "./overlays";
import { getService } from "./services";

function renderShell() {
    const service = getService();
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
        </MantineProvider>
    );
}

export const Shell = observer(renderShell);
