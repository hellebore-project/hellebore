import { DEFAULT_THEME, MantineProvider } from "@mantine/core";
import { render as baseRender } from "@testing-library/react";
import { PropsWithChildren, ReactNode } from "react";

import { PortalContainer } from "@/client/client";
import { getService } from "@/client";
import { observer } from "mobx-react-lite";

function renderTestApp({ children }: PropsWithChildren) {
    const service = getService();
    service.view.injectHooks();
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
