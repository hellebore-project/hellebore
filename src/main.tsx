import "@mantine/core/styles.css";
import "@mantine/tiptap/styles.css";

import { MantineProvider } from "@mantine/core";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./lib/app";
import { AppServiceContext } from "./lib/services";
import AppService from "./lib/services/app-service";

const APP_SERVICE = new AppService();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <MantineProvider defaultColorScheme="dark">
            <AppServiceContext.Provider value={APP_SERVICE}>
                <App />
            </AppServiceContext.Provider>
        </MantineProvider>
    </React.StrictMode>,
);
