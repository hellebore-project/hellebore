// mantine package styles must be imported before the application styles
import "@mantine/core/styles.css";
import "@mantine/tiptap/styles.css";
import "./app.css";

import { AppShell, MantineProvider } from "@mantine/core";
import { observer } from "mobx-react-lite";

import {
    CENTER_BG_COLOR,
    FOOTER_BG_COLOR,
    FOOTER_HEIGHT,
    HEADER_BG_COLOR,
    HEADER_HEIGHT,
    NAVBAR_BG_COLOR,
    NAVBAR_WIDTH,
} from "./constants";
import { Footer, Header, Center, LeftSideBar } from "./layout";
import { ArticleCreator, ProjectCreator } from "./modals";
import { getService } from "./services";
import { ContextMenu } from "./context-menu";
import { ThemeManager } from "./theme";

function renderApp() {
    const service = getService();
    return (
        <MantineProvider
            defaultColorScheme={ThemeManager.colorScheme}
            theme={ThemeManager.theme}
        >
            <AppShell
                header={{ height: { base: HEADER_HEIGHT } }}
                navbar={{
                    width: NAVBAR_WIDTH,
                    breakpoint: "sm",
                    collapsed: {
                        desktop: !service.domain.hasProject,
                        mobile:
                            !service.view.navBarMobileOpen ||
                            !service.domain.hasProject,
                    },
                }}
                footer={{
                    height: FOOTER_HEIGHT,
                }}
                padding="md"
            >
                <AppShell.Header bg={HEADER_BG_COLOR}>
                    <Header />
                </AppShell.Header>

                <AppShell.Navbar bg={NAVBAR_BG_COLOR}>
                    <LeftSideBar />
                </AppShell.Navbar>

                <AppShell.Main
                    display="flex"
                    bg={CENTER_BG_COLOR}
                    style={{ flexDirection: "column", overflow: "hidden" }}
                >
                    <Center />
                </AppShell.Main>

                <AppShell.Footer bg={FOOTER_BG_COLOR}>
                    <Footer />
                </AppShell.Footer>
            </AppShell>

            <ProjectCreator />
            <ArticleCreator />

            <ContextMenu />
        </MantineProvider>
    );
}

export const App = observer(renderApp);
