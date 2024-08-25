import { ArticleData } from "./article-data";

export interface PersonData {
    name: string;
}

export interface IdentifiedPerson extends ArticleData {
    data: PersonData;
}
