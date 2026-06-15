import type { Id } from "@/interface";
import type { ProjectResponse } from "@/api";

export class ClientData {
    private _project: ProjectResponse | null = $state(null);

    get project() {
        return this._project;
    }

    get projectId(): Id | null {
        return this._project?.id ?? null;
    }

    get loadedProjectId(): Id {
        if (this._project === null)
            throw new Error("No project is currently loaded.");

        return this._project.id;
    }

    setProject(project: ProjectResponse | null) {
        this._project = project;
    }

    clear() {
        this._project = null;
    }
}
