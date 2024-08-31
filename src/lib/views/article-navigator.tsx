import { observer } from "mobx-react-lite";

import { getService } from "../services";
import { ContentTree } from "../shared/content-tree";
import { ArticleTreeNodeData } from "../interface";

function renderArticleNavigator() {
    const service = getService();
    const onClickNode = (node: ArticleTreeNodeData) => {
        if (node.entityType !== undefined)
            service.view.openArticleEditorForId(Number(node.value));
    };
    return (
        <ContentTree<ArticleTreeNodeData>
            getData={() => service.view.navigation.articleNodes}
            onClick={onClickNode}
        />
    );
}

const ArticleNavigator = observer(renderArticleNavigator);

export default ArticleNavigator;
