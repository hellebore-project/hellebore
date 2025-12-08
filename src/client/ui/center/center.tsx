import { observer } from "mobx-react-lite";

import {
    getService,
    CentralViewType,
    HomeManager,
    EntryEditorService,
} from "@/client";

import { EntryEditor } from "./entry-editor";
import { Home } from "./home";
import { SettingsEditor } from "./settings-editor";

function renderCenter() {
    const service = getService();
    const panel = service.central.activePanel;
    if (panel === null) return null;

    switch (panel.type) {
        case CentralViewType.Home:
            return <Home service={panel as HomeManager} />;
        case CentralViewType.Settings:
            return <SettingsEditor />;
        case CentralViewType.EntryEditor:
            return <EntryEditor service={panel as EntryEditorService} />;
    }
}

export const Center = observer(renderCenter);
