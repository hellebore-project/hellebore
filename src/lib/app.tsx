import { AppShell } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { FOOTER_HEIGHT, HEADER_HEIGHT, NAVBAR_WIDTH } from "./constants";
import { Footer, Header, Center, LeftSideBar } from "./layout";
import { ArticleCreator, ArticleRemover, ProjectCreator } from "./modals";
import { getService } from "./services";

function renderApp() {
    const service = getService();
    return (
        <>
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
                <AppShell.Header>
                    <Header />
                </AppShell.Header>

                <AppShell.Navbar>
                    <LeftSideBar />
                </AppShell.Navbar>

                <AppShell.Main>
                    <Center />
                </AppShell.Main>

                <AppShell.Footer>
                    <Footer />
                </AppShell.Footer>
            </AppShell>

            <ProjectCreator />
            <ArticleCreator />
            <ArticleRemover />
        </>
    );
}

export const App = observer(renderApp);
