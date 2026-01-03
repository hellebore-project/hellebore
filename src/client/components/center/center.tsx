import { observer } from "mobx-react-lite";

import {
    CentralViewType,
    HomeManager,
    EntryEditorService,
    ICentralPanelContentService,
} from "@/client";

import { EntryEditor } from "./entry-editor";
import { Home } from "./home";
import { SettingsEditor } from "./settings-editor/settings-editor";

interface CenterProps {
    service: ICentralPanelContentService | null;
}

function renderCenter({ service }: CenterProps) {
    if (service === null) return null;

    switch (service.type) {
        case CentralViewType.Home:
            return <Home service={service as HomeManager} />;
        case CentralViewType.Settings:
            return <SettingsEditor />;
        case CentralViewType.EntryEditor:
            return <EntryEditor service={service as EntryEditorService} />;
    }
}

export const Center = observer(renderCenter);
