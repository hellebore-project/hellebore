import { TreeNodeData } from "@mantine/core";
import { makeAutoObservable, toJS } from "mobx";

import { ArticleInfoResponse, EntityType } from "../interface";
import { getArticles } from "./data-service";
import { ArticleTreeNodeData, compareTreeNodes } from "../model";

const ARTICLE_CATEGORY_LABELS: { [category: string]: string } = {
    [EntityType.LANGUAGE]: "Languages",
};

class NavigationService {
    _articleNodes: ArticleTreeNodeData[];

    constructor() {
        makeAutoObservable(this);
        this._articleNodes = [];

        getArticles().then(
            (articles) => this.addArticleNodes(articles),
            () =>
                console.error("Failed to fetch all articles from the backend."),
        );
    }

    get articleNodes() {
        return toJS(this._articleNodes);
    }

    addArticleNodes(articles: ArticleInfoResponse[]) {
        const categories: { [name: string]: ArticleTreeNodeData } = {};

        for (let article of articles) {
            const articleNode: ArticleTreeNodeData = {
                label: article.title,
                value: article.id.toString(),
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

        this._articleNodes.sort(compareTreeNodes);
    }

    updateArticleNode(id: number, type: EntityType, title: string) {
        for (let categoryNode of this._articleNodes) {
            if (categoryNode.value != type.toString()) continue;
            for (let articleNode of categoryNode?.children ?? []) {
                if (articleNode.value != id.toString()) continue;
                articleNode.label = title;
                break;
            }
            categoryNode.children?.sort(compareTreeNodes);
            break;
        }
    }

    getCategoryNode(type: EntityType): TreeNodeData {
        for (let node of this._articleNodes) {
            if (node.value === type.toString()) return node;
        }
        return this.addCategoryNode(type);
    }

    addCategoryNode(type: EntityType): TreeNodeData {
        const newNode: TreeNodeData = {
            label: ARTICLE_CATEGORY_LABELS[type],
            value: type.toString(),
            children: [],
        };
        this._articleNodes.push(newNode);
        return this._articleNodes[this._articleNodes.length - 1];
    }
}

export default NavigationService;
