import type { ProjectResponse } from "./project";

export interface SessionResponse {
    folderPath: string | null;
    project: ProjectResponse | null;
}
