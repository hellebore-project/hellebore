import type { ProjectResponse } from "./project";

export interface SessionResponse {
    dbFilePath: string | null;
    project: ProjectResponse | null;
}
