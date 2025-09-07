import { ProjectResponse, SessionResponse } from "@/domain/schema";
import { MockedInvoker } from "./invoker";
import { CommandNames } from "@/domain/constants";

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
    mockedInvoker.mockCommand(CommandNames.Session.Get, async () => response);
}

export function mockUpdateProject(
    mockedInvoker: MockedInvoker,
    { id }: MockUpdateProjectArguments,
) {
    mockedInvoker.mockCommand(CommandNames.Project.Update, async (name) => ({
        id,
        name,
    }));
}

export function mockCloseProject(mockedInvoker: MockedInvoker) {
    mockedInvoker.mockCommand(CommandNames.Project.Close, async () => {
        return;
    });
}
