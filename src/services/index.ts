import { AppManager } from "./app-manager";
import { AppState } from "./state";
export * from "./interface";

export let state: AppState = new AppState();

export function getService() {
    if (state.manager === null) {
        console.info("Setting up frontend services");
        state.manager = new AppManager();
        state.manager.initialize();
    }
    return state.manager;
}
