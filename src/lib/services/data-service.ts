import { invoke } from "@tauri-apps/api/tauri";

import { IdentifiedLanguage, LanguageData } from "../interface/entities";
import { Article } from "../interface";

export async function createLanguage(
    data: LanguageData,
): Promise<Article<IdentifiedLanguage>> {
    let response = invoke<Article<IdentifiedLanguage>>("create_language", {
        language: data,
    });
    console.log(response);
    return response;
}
