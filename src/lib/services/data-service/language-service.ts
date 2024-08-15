import { invoke } from "@tauri-apps/api/tauri";

import {
    Article,
    IdentifiedEntity,
    IdentifiedLanguage,
    LanguageData,
} from "../../interface";

export async function createLanguage(
    data: LanguageData,
): Promise<Article<IdentifiedLanguage>> {
    return invoke<Article<IdentifiedLanguage>>("create_language", {
        language: data,
    });
}

export async function updateLanguage(
    article: Article<IdentifiedEntity>,
): Promise<Article<IdentifiedLanguage>> {
    return invoke<Article<IdentifiedLanguage>>("update_language", {
        article: article,
    });
}

export async function getLanguage(
    id: number,
): Promise<Article<IdentifiedLanguage>> {
    return invoke<Article<IdentifiedLanguage>>("get_language", { id });
}
