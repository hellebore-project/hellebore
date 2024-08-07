import { IdentifiedEntity } from "./base";

export interface LanguageData {
    name: string;
}

export interface IdentifiedLanguage extends IdentifiedEntity {
    data: LanguageData;
}
