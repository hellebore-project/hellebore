import { AppManager } from "./app-manager";

export const APP_MANAGER = new AppManager();

export function getService() {
    return APP_MANAGER;
}
