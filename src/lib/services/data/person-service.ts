import { invoke } from "@tauri-apps/api/tauri";

import { ArticleResponse, IdentifiedPerson, PersonData } from "../../interface";

export async function createPerson(
    name: string,
): Promise<ArticleResponse<IdentifiedPerson>> {
    const data: PersonData = { name };
    return invoke<ArticleResponse<IdentifiedPerson>>("create_person", { data });
}
