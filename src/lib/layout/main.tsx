import { observer } from "mobx-react-lite";

import { ViewKey } from "../interface";
import { getService } from "../services";
import { Home } from "../views/home";
import { ArticleEditor } from "../views/article-editor";

function renderMain() {
    const service = getService();
    const viewKey = service.view.viewKey;
    if (viewKey === ViewKey.ARTICLE_EDITOR) return <ArticleEditor />;
    return <Home />;
}

export const Main = observer(renderMain);
