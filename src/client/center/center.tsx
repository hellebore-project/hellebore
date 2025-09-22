import { observer } from "mobx-react-lite";

import { getService, ViewKey } from "@/client";

import { EntryEditor } from "./entry-editor";
import { Home } from "./home";
import { SettingsEditor } from "./settings-editor";

function renderCenter() {
    const service = getService();
    const viewKey = service.currentView;
    if (service.isEntityEditorOpen) return <EntryEditor />;
    if (viewKey === ViewKey.Settings) return <SettingsEditor />;
    return <Home />;
}

export const Center = observer(renderCenter);
