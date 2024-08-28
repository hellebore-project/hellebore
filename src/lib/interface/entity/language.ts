import { BaseEntity } from "./base";

export interface LanguageData {
    name: string;
}

export interface IdentifiedLanguage extends BaseEntity {
    data: LanguageData;
}
