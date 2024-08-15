import { observer } from "mobx-react-lite";

import { getService } from "../services";
import ContentTree from "../shared/content-tree";
import { ArticleTreeNodeData } from "../model";

function renderArticleNavigator() {
    const service = getService();
    const onClickNode = (node: ArticleTreeNodeData) => {
        if (node.id !== undefined)
            service.view.openArticleEditorForId(node.id, node.entityType);
    };
    return (
        <ContentTree<ArticleTreeNodeData>
            getData={() => service.view.navigation.getArticleNodes()}
            onClick={onClickNode}
        />
    );
}

const ArticleNavigator = observer(renderArticleNavigator);

export default ArticleNavigator;
