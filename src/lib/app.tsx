import { AppShell } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { HEADER_HEIGHT } from "./constants";
import { Footer, Header, Center, LeftSideBar } from "./layout";
import { ArticleCreator, ProjectCreator } from "./modals";
import { getService } from "./services";

function renderApp() {
    const service = getService();
    return (
        <>
            <AppShell
                header={{ height: { base: HEADER_HEIGHT } }}
                navbar={{
                    width: 300,
                    breakpoint: "sm",
                    collapsed: { mobile: !service.view.sideBarOpen },
                }}
                footer={{
                    height: 25,
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
        </>
    );
}

export const App = observer(renderApp);
