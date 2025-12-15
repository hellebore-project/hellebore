import { ProjectResponse, SessionResponse } from "@/domain/schema";
import { CommandNames } from "@/domain/constants";

import { MockedInvoker } from "./invoker";

export interface MockGetSessionArgs {
    project: ProjectResponse;
    dbFilePath: string;
}

export interface MockUpdateProjectArgs {
    id: number;
}

export function mockGetSession(
    mockedInvoker: MockedInvoker,
    { project, dbFilePath }: MockGetSessionArgs,
) {
    const response: SessionResponse = {
        project,
        dbFilePath,
    };
    mockedInvoker.mockCommand(CommandNames.Session.Get, async () => response);
}

export function mockUpdateProject(
    mockedInvoker: MockedInvoker,
    { id }: MockUpdateProjectArgs,
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
