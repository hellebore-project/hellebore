import { ArticleData } from "./article-data";

export interface LanguageData {
    name: string;
}

export interface IdentifiedLanguage extends ArticleData {
    data: LanguageData;
}
