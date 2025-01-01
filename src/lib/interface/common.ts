export enum ValueChange {
    NOT_SET,
    UPDATED,
    UNCHANGED,
}

export interface IdentifiedObject {
    id: number;
}

export interface Point {
    x: number;
    y: number;
}
