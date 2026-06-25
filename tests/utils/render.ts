import { render as svelteRender } from "@testing-library/svelte";

import TestWrapper from "./wrapper.svelte";

export function render(Component: any, options?: any): any {
    const container = document.createElement("div");
    document.body.appendChild(container);

    return svelteRender(
        TestWrapper,
        {
            ...options,
            props: {
                Component,
                componentProps: options?.props ?? {},
            },
            target: container,
        },
        {
            baseElement: container,
        },
    );
}
