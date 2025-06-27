import { vi } from "vitest";

import { SessionManager } from "@/services/domain/session-manager";
import { SessionResponse } from "@/interface";

export interface MockGetSessionArguments {
    manager: SessionManager;
    projectName: string;
    dbFilePath: string;
}

export function mockGetSession({
    manager,
    projectName,
    dbFilePath,
}: MockGetSessionArguments) {
    let response: SessionResponse = {
        project: {
            id: 0,
            name: projectName,
        },
        db_file_path: dbFilePath,
    };
    const spy = vi
        .spyOn(manager, "_getSession")
        .mockImplementation(async () => response);

    return spy;
}
