import type { IdentifiedObject } from "@/interface";

export interface ProjectUpdate {
    name?: string | null;
}

export interface ProjectResponse extends IdentifiedObject {
    name: string;
}
