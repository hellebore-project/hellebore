import type { ProjectResponse } from "@/api/interface";

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
