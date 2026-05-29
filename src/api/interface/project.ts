import type { IdentifiedObject } from "@/interface/common";

export interface ProjectUpdate {
    name?: string | null;
}

export interface ProjectResponse extends IdentifiedObject {
    name: string;
}
