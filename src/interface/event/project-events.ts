import type { ProjectResponse } from "@/api";

export interface CreateProjectEvent {
    name: string;
    folderPath: string;
}

export interface ProjectChangeEvent {
    nameChanged?: boolean;
    syncImmediately?: boolean;
}

export interface LoadProjectEvent {
    loaded: boolean;
    project: ProjectResponse | null;
}
