export type Id = number;

export interface IdentifiedObject {
    id: Id;
}

export interface Point {
    x: number;
    y: number;
}

export interface Rectangle {
    top: number;
    bottom: number;
    left: number;
    right: number;
}
