import { TreeNodeData } from "@mantine/core";
import { makeAutoObservable, toJS } from "mobx";

import {
    ArticleInfoResponse,
    ArticleUpdateResponse,
    ENTITY_TYPE_PLURAL_LABELS,
    EntityType,
} from "../interface";
import { ArticleTreeNodeData, compareTreeNodes } from "../interface";

const ARTICLE_CATEGORY_LABELS: { [type: number]: string } = {
    ...ENTITY_TYPE_PLURAL_LABELS,
};

class NavigationService {
    _articleNodes: ArticleTreeNodeData[];

    constructor() {
        makeAutoObservable(this);
        this._articleNodes = [];
    }

    get articleNodes() {
        return toJS(this._articleNodes);
    }

    setupArticleNodes(articles: ArticleInfoResponse[]) {
        const nodes: ArticleTreeNodeData[] = [];
        const categories: { [id: number]: ArticleTreeNodeData } = {};

        for (let article of articles) {
            let categoryNode: ArticleTreeNodeData;
            if (categories.hasOwnProperty(article.entity_type))
                categoryNode = categories[article.entity_type];
            else {
                categoryNode = this.getCategoryNode(nodes, article.entity_type);
                categories[article.entity_type] = categoryNode;
            }
            this._addArticleNode(categoryNode, article);
        }

        for (let categoryNode of Object.values(categories))
            categoryNode.children?.sort(compareTreeNodes);

        nodes.sort(compareTreeNodes);
        this._articleNodes = nodes;
    }

    addArticleNode(article: ArticleInfoResponse) {
        const categoryNode = this.getCategoryNode(
            this._articleNodes,
            article.entity_type,
        );
        this._addArticleNode(categoryNode, article);
        categoryNode.children?.sort(compareTreeNodes);
        this._articleNodes.sort(compareTreeNodes);
    }

    _addArticleNode(
        categoryNode: ArticleTreeNodeData,
        article: ArticleInfoResponse,
    ) {
        const articleNode: ArticleTreeNodeData = {
            label: article.title,
            value: article.id.toString(),
            entityType: article.entity_type,
        };
        categoryNode.children?.push(articleNode);
    }

    updateArticleNode({
        id,
        entity_type,
        title,
        isTitleUnique,
    }: ArticleUpdateResponse) {
        if (title == "" || !isTitleUnique) return;
        for (let categoryNode of this._articleNodes) {
            if (categoryNode.value != entity_type.toString()) continue;
            for (let articleNode of categoryNode?.children ?? []) {
                if (articleNode.value != id.toString()) continue;
                articleNode.label = title;
                break;
            }
            categoryNode.children?.sort(compareTreeNodes);
            break;
        }
    }

    getCategoryNode(
        nodes: ArticleTreeNodeData[],
        type: EntityType,
    ): TreeNodeData {
        for (let node of nodes) {
            if (node.value === type.toString()) return node;
        }
        return this.addCategoryNode(nodes, type);
    }

    addCategoryNode(
        nodes: ArticleTreeNodeData[],
        type: EntityType,
    ): TreeNodeData {
        const newNode: TreeNodeData = {
            label: ARTICLE_CATEGORY_LABELS[type],
            value: type.toString(),
            children: [],
        };
        nodes.push(newNode);
        return nodes[nodes.length - 1];
    }
}

export default NavigationService;
