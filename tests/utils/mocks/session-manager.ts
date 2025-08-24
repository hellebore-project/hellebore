import { vi } from "vitest";

import { ProjectResponse, SessionResponse } from "@/schema";
import { SessionManager } from "@/services/domain/session-manager";

interface MockSessionArguments {
    manager: SessionManager;
}

export interface MockGetSessionArguments extends MockSessionArguments {
    project: ProjectResponse;
    dbFilePath: string;
}

export interface MockUpdateProjectArguments extends MockSessionArguments {
    id: number;
}

export function mockGetSession({
    manager,
    project,
    dbFilePath,
}: MockGetSessionArguments) {
    let response: SessionResponse = {
        project,
        db_file_path: dbFilePath,
    };
    const spy = vi
        .spyOn(manager, "_getSession")
        .mockImplementation(async () => response);
    return spy;
}

export function mockUpdateProject({ manager, id }: MockUpdateProjectArguments) {
    const spy = vi
        .spyOn(manager, "_updateProject")
        .mockImplementation(async (name) => ({ id, name }));
    return spy;
}
