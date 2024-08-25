import { invoke } from "@tauri-apps/api/tauri";

import {
    ArticleResponse,
    IdentifiedLanguage,
    LanguageData,
} from "../../interface";

export async function createLanguage(
    name: string,
): Promise<ArticleResponse<IdentifiedLanguage>> {
    const data: LanguageData = { name };
    return invoke<ArticleResponse<IdentifiedLanguage>>("create_language", {
        data,
    });
}
