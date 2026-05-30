import { render as svelteRender } from "@testing-library/svelte";

import { SHARED_PORTAL_ID } from "@/constants";

export function render(Component: any, options?: any): any {
    if (!document.getElementById(SHARED_PORTAL_ID)) {
        const portal = document.createElement("div");
        portal.id = SHARED_PORTAL_ID;
        document.body.appendChild(portal);
    }
    return svelteRender(Component, options);
}
