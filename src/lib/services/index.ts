import { createContext, useContext } from "react";

import { AppService } from "./app-service";

export const AppServiceContext = createContext<AppService>(new AppService());

export function getService() {
    return useContext(AppServiceContext);
}
