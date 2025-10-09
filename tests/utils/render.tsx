import { DEFAULT_THEME, MantineProvider } from "@mantine/core";
import { render as baseRender } from "@testing-library/react";
import { PropsWithChildren, ReactNode } from "react";
import { observer } from "mobx-react-lite";

import { getService, PortalContainer } from "@/client";

function renderTestApp({ children }: PropsWithChildren) {
    const service = getService();
    service.injectHooks();
    return (
        <MantineProvider theme={DEFAULT_THEME} env="test">
            {children}
            <PortalContainer />
        </MantineProvider>
    );
}

const TestApp = observer(renderTestApp);

export const render = (component: ReactNode) => {
    return baseRender(component, { wrapper: TestApp });
};
