import { ClientManager } from "./client-manager";
import { AppState } from "./state";

export const state: AppState = new AppState();

export function getService() {
    if (state.manager === null) {
        console.info("Setting up frontend services");
        state.manager = new ClientManager();
        state.manager.load();
    }
    return state.manager;
}
