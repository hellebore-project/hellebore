import { observer } from "mobx-react-lite";

import { ViewKey } from "@/interface";
import { getService } from "@/services";
import { EntityEditor } from "./entity-editor";
import { Home } from "./home";
import { SettingsEditor } from "./settings-editor";

function renderCenter() {
    const service = getService();
    const viewKey = service.view.currentView;
    if (service.view.isEntityEditorOpen) return <EntityEditor />;
    if (viewKey === ViewKey.Settings) return <SettingsEditor />;
    return <Home />;
}

export const Center = observer(renderCenter);
