import { observer } from "mobx-react-lite";

import { ModalKey } from "@/interface";
import { getService } from "@/services";
import { ConfirmModal } from "./confirm";

function renderArticleRemover() {
    const service = getService();
    const id = service.view.articleRemover.id;
    let prompt = "";
    if (id !== null) {
        const articleTitle =
            service.domain.articles.getInfo(id)?.title ?? "unknown";
        prompt = `Are you sure that you want to delete the article for '${articleTitle}'? This action is irreversible.`;
    }

    return (
        <ConfirmModal
            modalKey={ModalKey.ARTICLE_REMOVER}
            title="Delete article"
            prompt={prompt}
            submit={{
                label: "Delete",
                color: "red",
                onClick: () => {
                    if (id !== null) service.view.deleteArticle(id);
                },
            }}
            cancel={{
                color: "blue",
            }}
        />
    );
}

export const ArticleRemover = observer(renderArticleRemover);
