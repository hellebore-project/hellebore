export enum ValueChange {
    NOT_SET,
    UPDATED,
    UNCHANGED,
}

export type Id = number;

export interface IdentifiedObject {
    id: Id;
}

export interface Point {
    x: number;
    y: number;
}
