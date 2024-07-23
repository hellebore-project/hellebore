import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import '@mantine/core/styles.css';
import { MantineProvider, AppShell, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

interface HeaderArgs {
    burgerOpen: boolean;
    burgerToggle: () => void;
}

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

function Navbar() {
    return "";
}

function ContentPane() {
    const [greetMsg, setGreetMsg] = useState("");
    const [name, setName] = useState("");

    async function greet() {
        // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
        setGreetMsg(await invoke("greet", { name }));
    }

    return (
        <div className="container">
            <h1>Home</h1>
            <form
                className="row"
                onSubmit={(e) => {
                    e.preventDefault();
                    greet();
                }}
            >
                <input
                    id="greet-input"
                    onChange={(e) => setName(e.currentTarget.value)}
                    placeholder="Enter a name..."
                />
                <button type="submit">Greet</button>
            </form>
            <p>{greetMsg}</p>
        </div>
    );
}

function App() {
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
                    <Navbar/>
                </AppShell.Navbar>

                <AppShell.Main>
                    <ContentPane/>
                </AppShell.Main>
            </AppShell>
        </MantineProvider>
    );
}

export default App;
