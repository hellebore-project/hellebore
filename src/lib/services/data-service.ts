import { invoke } from "@tauri-apps/api/tauri";

import { Entity, LanguageData } from "../entities";

export async function createLanguage(data: LanguageData): Promise<Entity> {
    return invoke("create_language", { language: data });
}
