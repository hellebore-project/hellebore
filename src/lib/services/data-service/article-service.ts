import { invoke } from "@tauri-apps/api/tauri";

import {
    Article,
    ArticleItem,
    EntityType,
    IdentifiedEntity,
} from "../../interface";
import {
    createLanguage,
    getLanguage,
    updateLanguage,
} from "./language-service";

export async function createArticle(
    title: string,
    entityType: EntityType | null,
): Promise<Article<IdentifiedEntity> | null> {
    if (entityType === EntityType.LANGUAGE)
        return await createLanguage({ name: title });
    console.error(`Unabled to create articles with entity type ${entityType}.`);
    return null;
}

export async function updateArticle(
    article: Article<IdentifiedEntity>,
): Promise<Article<IdentifiedEntity> | null> {
    if (article.entity_type === EntityType.LANGUAGE)
        return await updateLanguage(article);
    console.error(
        `Unabled to update articles with entity type ${article.entity_type}.`,
    );
    return null;
}

export async function getArticle(
    id: number,
    entityType: EntityType | null | undefined,
): Promise<Article<IdentifiedEntity> | null> {
    if (entityType === EntityType.LANGUAGE) return await getLanguage(id);
    console.error(
        `Unabled to retrieve articles with entity type ${entityType}.`,
    );
    return null;
}

export async function getArticles(): Promise<ArticleItem[]> {
    let response = invoke<ArticleItem[]>("get_articles");
    return response;
}
