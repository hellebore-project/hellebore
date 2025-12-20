export * from "./portal-manager";
export * from "./header-manager";
export * from "./footer-manager";
export * from "./navigation";
export * from "./center";
export * from "./modal";
export * from "./context-menu";
export * from "./client-manager";

import { ClientManager } from "./client-manager";
import { AppState } from "./state";

export const state: AppState = new AppState();

export function getClientManager() {
    if (state.manager === null) {
        console.info("Setting up frontend services");
        state.manager = new ClientManager();
        state.manager.load();
    }
    return state.manager;
}
