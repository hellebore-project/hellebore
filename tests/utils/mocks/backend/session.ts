import { CommandNames, type ProjectResponse } from "@/api";

import { MockedInvoker } from "./invoker";

export function mockLoadProject(
    mockedInvoker: MockedInvoker,
    project: ProjectResponse | null,
) {
    mockedInvoker.mockCommand(CommandNames.Project.Load, async () => project);
}

export function mockUpdateProject(
    mockedInvoker: MockedInvoker,
    { id }: { id: number },
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
