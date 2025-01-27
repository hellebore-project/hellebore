import { observer } from "mobx-react-lite";

import { ViewKey } from "@/interface";
import { getService } from "@/services";
import { EntityEditor, Home, SettingsEditor } from "./views";

function renderCenter() {
    const service = getService();
    const viewKey = service.view.viewKey;
    if (service.view.isEntityEditorOpen) return <EntityEditor />;
    if (viewKey === ViewKey.SETTINGS) return <SettingsEditor />;
    return <Home />;
}

export const Center = observer(renderCenter);
