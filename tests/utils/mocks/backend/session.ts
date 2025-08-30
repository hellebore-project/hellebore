import { ProjectResponse, SessionResponse } from "@/schema";
import { MockedInvoker } from "./invoker";

export interface MockGetSessionArguments {
    project: ProjectResponse;
    dbFilePath: string;
}

export interface MockUpdateProjectArguments {
    id: number;
}

export function mockGetSession(
    mockedInvoker: MockedInvoker,
    { project, dbFilePath }: MockGetSessionArguments,
) {
    let response: SessionResponse = {
        project,
        db_file_path: dbFilePath,
    };
    mockedInvoker.mockCommand("get_session", async () => response);
}

export function mockUpdateProject(
    mockedInvoker: MockedInvoker,
    { id }: MockUpdateProjectArguments,
) {
    mockedInvoker.mockCommand("update_project", async (name) => ({ id, name }));
}

export function mockCloseProject(mockedInvoker: MockedInvoker) {
    mockedInvoker.mockCommand("close_project", async () => {
        return;
    });
}
