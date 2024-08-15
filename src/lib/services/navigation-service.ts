import { TreeNodeData } from "@mantine/core";
import { makeAutoObservable, toJS } from "mobx";

import { ArticleItem, EntityType } from "../interface";
import { getArticles } from "./data-service";
import { ArticleTreeNodeData, compareTreeNodes } from "../model";

const ARTICLE_CATEGORY_LABELS: { [category: string]: string } = {
    [EntityType.LANGUAGE]: "Languages",
};

class NavigationService {
    articleNodes: ArticleTreeNodeData[];

    constructor() {
        makeAutoObservable(this);
        this.articleNodes = [];

        getArticles().then(
            (articles) => this.addArticleNodes(articles),
            () => console.log("Failed to fetch all articles from the backend."),
        );
    }

    getArticleNodes() {
        return toJS(this.articleNodes);
    }

    addArticleNodes(articles: ArticleItem[]) {
        const categories: { [name: string]: ArticleTreeNodeData } = {};

        for (let article of articles) {
            const articleNode: ArticleTreeNodeData = {
                label: article.title,
                value: article.id.toString(),
                id: article.id,
                entityType: article.entity_type,
            };

            let categoryNode: ArticleTreeNodeData;
            if (article.entity_type in categories)
                categoryNode = categories[article.entity_type];
            else {
                categoryNode = this.getCategoryNode(article.entity_type);
                categories[article.entity_type] = categoryNode;
            }
            categoryNode.children?.push(articleNode);
        }

        for (let categoryNode of Object.values(categories))
            categoryNode.children?.sort(compareTreeNodes);

        this.articleNodes.sort(compareTreeNodes);
    }

    getCategoryNode(value: string): TreeNodeData {
        for (let node of this.articleNodes) {
            if (node.value === value) return node;
        }
        return this.addCategoryNode(value);
    }

    addCategoryNode(value: string): TreeNodeData {
        const newNode: TreeNodeData = {
            label: ARTICLE_CATEGORY_LABELS[value],
            value: value,
            children: [],
        };
        this.articleNodes.push(newNode);
        return this.articleNodes[this.articleNodes.length - 1];
    }
}

export default NavigationService;
