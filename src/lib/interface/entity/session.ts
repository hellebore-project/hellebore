import { ProjectResponse } from "./project";

export interface SessionResponse {
    db_file_path: string;
    project: ProjectResponse;
}
