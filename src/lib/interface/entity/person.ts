import { BaseEntity } from "./base";

export enum PersonProperty {
    NAME = "name",
}

export interface PersonData extends BaseEntity {
    name: string;
}
