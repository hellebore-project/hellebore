import { invoke } from "@tauri-apps/api/tauri";

import {
    ArticleResponse,
    ArticleUpdate,
    Entity,
    IdentifiedLanguage,
    LanguageData,
    UpdateResponse,
} from "../../interface";

export async function createLanguage(
    data: LanguageData,
): Promise<ArticleResponse<IdentifiedLanguage>> {
    return invoke<ArticleResponse<IdentifiedLanguage>>("create_language", {
        language: data,
    });
}

export async function updateLanguage(
    article: ArticleUpdate<Entity>,
): Promise<UpdateResponse<null>> {
    console.log(article);
    return invoke<UpdateResponse<null>>("update_language", { article });
}

export async function getLanguage(
    id: number,
): Promise<ArticleResponse<IdentifiedLanguage>> {
    return invoke<ArticleResponse<IdentifiedLanguage>>("get_language", { id });
}
