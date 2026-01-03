import { AppShell, MantineProvider } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { ClientManager } from "./client.service";
import { PortalContainer } from "./portal";
import { Header } from "./header";
import { LeftSideBar } from "./left-sidebar";
import { Center } from "./center";
import { Footer } from "./footer";
import { Modal } from "./modal";
import { ContextMenu } from "./context-menu";

interface ClientProps {
    service: ClientManager;
}

function renderClient({ service }: ClientProps) {
    service.hook();

    return (
        <MantineProvider
            defaultColorScheme={service.style.colorScheme}
            theme={service.style.theme}
        >
            <AppShell
                header={{ height: { base: service.header.height } }}
                navbar={{
                    width: service.leftSideBar.width,
                    breakpoint: "sm",
                    collapsed: {
                        desktop: !service.domain.hasProject,
                        mobile:
                            !service.leftSideBar.mobileOpen ||
                            !service.domain.hasProject,
                    },
                }}
                footer={{
                    height: service.footer.height,
                }}
                padding={service.centerPadding}
            >
                <AppShell.Header className="header-panel">
                    <Header service={service.header} />
                </AppShell.Header>

                <AppShell.Navbar className="left-sidebar-panel">
                    <LeftSideBar service={service.leftSideBar} />
                </AppShell.Navbar>

                <AppShell.Main className="main-panel" tabIndex={-1}>
                    <Center service={service.central.activePanelService} />
                </AppShell.Main>

                <AppShell.Footer className="footer-panel">
                    <Footer service={service.footer} />
                </AppShell.Footer>
            </AppShell>

            <Modal service={service.modal} />

            <ContextMenu service={service.contextMenu} />

            <PortalContainer service={service.portal} />
        </MantineProvider>
    );
}

export const Client = observer(renderClient);
