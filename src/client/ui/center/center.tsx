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
    const panelService = service.central.activePanel;
    if (panelService === null) return null;

    switch (panelService.type) {
        case CentralViewType.Home:
            return <Home service={panelService as HomeManager} />;
        case CentralViewType.Settings:
            return <SettingsEditor />;
        case CentralViewType.EntryEditor:
            return <EntryEditor service={panelService as EntryEditorService} />;
    }
}

export const Center = observer(renderCenter);
