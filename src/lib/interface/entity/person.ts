import { BaseEntity } from "./base";

export interface PersonData {
    name: string;
}

export interface IdentifiedPerson extends BaseEntity {
    data: PersonData;
}
