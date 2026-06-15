import type { IdentifiedObject } from "@/interface";

export interface ProjectUpdate extends IdentifiedObject {
    name?: string | null;
}

export interface ProjectResponse extends IdentifiedObject {
    name: string;
}
