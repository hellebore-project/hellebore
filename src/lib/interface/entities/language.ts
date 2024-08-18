import { Entity } from "./base";

export interface LanguageData {
    name: string;
}

export interface IdentifiedLanguage extends Entity {
    data: LanguageData;
}
