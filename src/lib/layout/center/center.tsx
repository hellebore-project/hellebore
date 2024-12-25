import { observer } from "mobx-react-lite";

import { ViewKey } from "@/interface";
import { getService } from "@/services";
import { ArticleEditor, Home, SettingsEditor } from "./views";

function renderCenter() {
    const service = getService();
    const viewKey = service.view.viewKey;
    if (viewKey === ViewKey.ARTICLE_EDITOR) return <ArticleEditor />;
    if (viewKey === ViewKey.SETTINGS) return <SettingsEditor />;
    return <Home />;
}

export const Center = observer(renderCenter);
