import type { ProjectResponse } from "@/api";

import type { HomeManager } from "./home-service.svelte";

export interface HomeLoadArgs {
    project: ProjectResponse | null;
}

export interface HomeProps {
    service: HomeManager;
}
