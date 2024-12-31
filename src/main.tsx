import "@mantine/core/styles.css";
import "@mantine/tiptap/styles.css";

import { MantineProvider } from "@mantine/core";
import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "@/app";
import { DEFAULT_COLOR_SCHEME, variantColorResolver } from "@/theme";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <MantineProvider
            defaultColorScheme={DEFAULT_COLOR_SCHEME}
            theme={{ variantColorResolver }}
        >
            <App />
        </MantineProvider>
    </React.StrictMode>,
);
