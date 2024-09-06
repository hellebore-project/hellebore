import { AppService } from "./app-service";

export const appService = new AppService();

export function getService() {
    return appService;
}
