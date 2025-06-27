import { DEFAULT_THEME, MantineProvider } from "@mantine/core";
import { render as baseRender } from "@testing-library/react";
import { PropsWithChildren, ReactNode } from "react";

const Providers = ({ children }: PropsWithChildren) => {
    return (
        <MantineProvider theme={DEFAULT_THEME} env="test">
            {children}
        </MantineProvider>
    );
};

export const render = (component: ReactNode) => {
    return baseRender(component, { wrapper: Providers });
};
