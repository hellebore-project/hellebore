import type { IdentifiedObject } from "../common";

export interface ProjectUpdate {
    name?: string | null;
}

export interface ProjectResponse extends IdentifiedObject {
    name: string;
}
