import { CommandNames, type ProjectResponse } from "@/api";

import { MockedInvoker, MockedCommand } from "./invoker";

export function mockLoadProject(
    mockedInvoker: MockedInvoker,
    project: ProjectResponse | null,
) {
    mockedInvoker.mockCommand(CommandNames.Project.Load, async () => project);
}

export function mockUpdateProject(
    mockedInvoker: MockedInvoker,
    project: ProjectResponse,
) {
    const command = async ({ id, name }: ProjectResponse) => ({
        id: id ?? project.id,
        name: name ?? project.name,
    });
    mockedInvoker.mockCommand(
        CommandNames.Project.Update,
        command as MockedCommand,
    );
}

export function mockCloseProject(mockedInvoker: MockedInvoker) {
    mockedInvoker.mockCommand(CommandNames.Project.Close, async () => {
        return;
    });
}
