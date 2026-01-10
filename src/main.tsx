import { observer } from "mobx-react-lite";
import React from "react";
import ReactDOM from "react-dom/client";

import { Client } from "@/components";
import { getState } from "@/state";

function renderApp() {
    const service = getState().manager;
    return <Client service={service} />;
}

const App = observer(renderApp);

ReactDOM.createRoot(document.getElementById("app-root") as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
