import { observer } from "mobx-react-lite";

import { ViewKey } from "@/domain/constants";
import { getService } from "@/client";
import { EntityEditor } from "./entity-editor";
import { Home } from "./home";
import { SettingsEditor } from "./settings-editor";

function renderCenter() {
    const service = getService();
    const viewKey = service.currentView;
    if (service.isEntityEditorOpen) return <EntityEditor />;
    if (viewKey === ViewKey.Settings) return <SettingsEditor />;
    return <Home />;
}

export const Center = observer(renderCenter);
