import { MantineProvider } from "@mantine/core";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./lib/app";
import { AppServiceContext } from "./lib/services";
import AppService from "./lib/services/app-service";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <MantineProvider defaultColorScheme="dark">
            <AppServiceContext.Provider value={new AppService()}>
                <App />
            </AppServiceContext.Provider>
        </MantineProvider>
    </React.StrictMode>,
);
