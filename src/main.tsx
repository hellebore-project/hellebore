import React from "react";
import ReactDOM from "react-dom/client";

import { Client } from "./client";

ReactDOM.createRoot(document.getElementById("app-root") as HTMLElement).render(
    <React.StrictMode>
        <Client />
    </React.StrictMode>,
);
