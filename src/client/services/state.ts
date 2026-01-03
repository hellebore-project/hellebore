import { ClientManager } from "./client-manager";

export class AppState {
    private _manager: ClientManager | null = null;

    get manager() {
        if (this._manager === null) {
            console.info("Setting up frontend services");
            this._manager = new ClientManager();
            this.manager.load();
        }
        return this._manager;
    }

    set manager(mgr: ClientManager) {
        this._manager = mgr;
    }
}

export const state: AppState = new AppState();

export function getState(): AppState {
    return state;
}
