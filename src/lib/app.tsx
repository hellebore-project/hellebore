import { AppShell } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { Footer, Header, Center, LeftSideBar } from "./layout";
import { getService } from "./services";
import { ArticleCreator } from "./modals/article-creator";

function renderApp() {
    const service = getService();
    return (
        <>
            <AppShell
                header={{ height: { base: 50 } }}
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

            <ArticleCreator />
        </>
    );
}

export const App = observer(renderApp);
