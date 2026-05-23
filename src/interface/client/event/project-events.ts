import type { ProjectResponse } from "../../domain";

export interface CreateProjectEvent {
    name: string;
    dbFilePath: string;
}

export interface ProjectChangeEvent {
    nameChanged?: boolean;
    syncImmediately?: boolean;
}

export interface LoadProjectEvent {
    loaded: boolean;
    project: ProjectResponse | null;
}
