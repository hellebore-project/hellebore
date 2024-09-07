import { AppShell } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { Header, Main, SideBar } from "./layout";
import { getService } from "./services";
import { ArticleCreator } from "./views/article-creator";

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
                padding="md"
            >
                <AppShell.Header>
                    <Header />
                </AppShell.Header>

                <AppShell.Navbar>
                    <SideBar />
                </AppShell.Navbar>

                <AppShell.Main>
                    <Main />
                </AppShell.Main>
            </AppShell>

            <ArticleCreator />
        </>
    );
}

export const App = observer(renderApp);
