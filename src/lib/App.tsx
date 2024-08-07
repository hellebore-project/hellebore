import { AppShell } from "@mantine/core";
import { observer } from "mobx-react-lite";

import Header from "./layout/header";
import SideBar from "./layout/sidebar";
import Main from "./layout/main";
import { getService } from "./services";

function renderApp() {
    const service = getService();
    return (
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

            <AppShell.Navbar p="md">
                <SideBar />
            </AppShell.Navbar>

            <AppShell.Main>
                <Main />
            </AppShell.Main>
        </AppShell>
    );
}

const App = observer(renderApp);

export default App;
