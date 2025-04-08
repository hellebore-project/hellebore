import { AppManager } from "./app-manager";

console.log("Setting up frontend services");
export const APP_MANAGER = new AppManager();

export function getService() {
    return APP_MANAGER;
}
