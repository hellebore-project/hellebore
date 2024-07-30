import { observer } from "mobx-react-lite";

import { ViewKey } from "../services/constants";
import Home from "../views/home";
import ArticleCreator from "../views/article-creator";
import { getService } from "../services";

function renderMain() {
    const service = getService();
    const viewKey = service.view.viewKey;
    if (viewKey === ViewKey.ARTICLE_CREATOR) return <ArticleCreator />;
    return <Home />;
}

const Main = observer(renderMain);

export default Main;
