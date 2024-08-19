import { invoke } from "@tauri-apps/api/tauri";

import {
    ArticleResponse,
    ArticleInfoResponse,
    EntityType,
    ArticleData,
    ArticleUpdate,
    UpdateResponse,
} from "../../interface";
import {
    createLanguage,
    getLanguage,
    updateLanguage,
} from "./language-service";

export async function createArticle(
    title: string,
    entityType: EntityType | null,
): Promise<ArticleResponse<ArticleData> | null> {
    if (entityType === EntityType.LANGUAGE)
        return await createLanguage({ name: title });
    console.error(`Unabled to create articles with entity type ${entityType}.`);
    return null;
}

export async function updateArticle(
    article: ArticleUpdate<ArticleData>,
): Promise<UpdateResponse<null> | null> {
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
): Promise<ArticleResponse<ArticleData> | null> {
    if (entityType === EntityType.LANGUAGE) return await getLanguage(id);
    console.error(
        `Unabled to retrieve articles with entity type ${entityType}.`,
    );
    return null;
}

export async function getArticles(): Promise<ArticleInfoResponse[]> {
    let response = invoke<ArticleInfoResponse[]>("get_articles");
    return response;
}
