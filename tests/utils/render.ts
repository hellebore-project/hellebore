import { render as svelteRender } from "@testing-library/svelte";

import { SHARED_PORTAL_ID } from "@/constants";

export function render(Component: any, options?: any): any {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const portal = document.createElement("div");
    portal.id = SHARED_PORTAL_ID;
    container.appendChild(portal);

    return svelteRender(
        Component,
        {
            ...options,
            target: container,
        },
        {
            baseElement: container,
        },
    );
}
