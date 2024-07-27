import '@mantine/core/styles.css';
import { MantineProvider, AppShell, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from "react";

import { ViewKey } from '../constants';
import Home from './views/Home';
import { ContentPaneArgs, HeaderArgs } from './models/args';

const VIEW_MAPPING = {
    [ViewKey.HOME]: Home,
    [ViewKey.ARTICLE]: Home,
    [ViewKey.ARTICLE_EDITOR]: Home,
    [ViewKey.ARTICLE_LIST]: Home,
};

function Header({ burgerOpen, burgerToggle }: HeaderArgs) {
    return (
        <Burger
            opened={burgerOpen}
            onClick={burgerToggle}
            hiddenFrom="sm"
            size="sm"
        />
    );
}

function Sidebar() {
    return "";
}

function ContentPane({ viewKey, ...rest }: ContentPaneArgs) {
    const component = VIEW_MAPPING[viewKey];
    return component(rest);
}

function App() {
    const [viewKey, setView] = useState(ViewKey.HOME);
    const [navBarOpen, navBarHandlers] = useDisclosure();
    return (
        <MantineProvider defaultColorScheme="dark">
            <AppShell
                header={{ height: 60 }}
                navbar={{
                    width: 300,
                    breakpoint: 'sm',
                    collapsed: { mobile: !navBarOpen },
                }}
                padding="md"
            >
                <AppShell.Header>
                    <Header
                        burgerOpen={navBarOpen}
                        burgerToggle={navBarHandlers.toggle}
                    />
                </AppShell.Header>

                <AppShell.Navbar p="md">
                    <Sidebar/>
                </AppShell.Navbar>

                <AppShell.Main>
                    <ContentPane viewKey={viewKey} setView={setView} />
                </AppShell.Main>
            </AppShell>
        </MantineProvider>
    );
}

export default App;
