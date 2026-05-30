import { describe, expect, vi } from "vitest";

import { CommandNames } from "@/api";
import { mockCloseProject, mockGetSession } from "@tests/utils/mocks";

import { test } from "./fixtures";

const expectInvokePayloadMatch = (
    calls: unknown[][],
    command: string,
    payload: unknown,
) => {
    expect(
        calls.some(
            ([name, args]) =>
                name === command &&
                JSON.stringify(args) === JSON.stringify(payload),
        ),
    ).toBe(true);
};

describe("session manager contracts", () => {
    test("getSession returns backend payload and emits session get invoke", async ({
        mockedInvoker,
        sessionManager,
        session,
        project,
    }) => {
        mockGetSession(mockedInvoker, {
            project,
            folderPath: session.folderPath ?? "",
        });

        const response = await sessionManager.getSession();

        expect(response).toStrictEqual(session);
        expectInvokePayloadMatch(
            mockedInvoker.spy.mock.calls,
            CommandNames.Session.Get,
            {},
        );
    });

    test("createProject sends name and parentFolderPath and returns project", async ({
        mockedInvoker,
        sessionManager,
        project,
    }) => {
        mockedInvoker.mockCommand(
            CommandNames.Project.Create,
            async () => project,
        );

        const response = await sessionManager.createProject(
            project.name,
            "/tmp/new-project",
        );

        expect(response).toStrictEqual(project);
        expectInvokePayloadMatch(
            mockedInvoker.spy.mock.calls,
            CommandNames.Project.Create,
            {
                name: project.name,
                folderPath: "/tmp/new-project",
            },
        );
    });

    test("loadProject emits load invoke and returns backend project", async ({
        mockedInvoker,
        sessionManager,
        project,
    }) => {
        mockedInvoker.mockCommand(
            CommandNames.Project.Load,
            async () => project,
        );

        const response = await sessionManager.loadProject("/tmp/my-project");

        expect(response).toStrictEqual(project);
        expectInvokePayloadMatch(
            mockedInvoker.spy.mock.calls,
            CommandNames.Project.Load,
            {
                folderPath: "/tmp/my-project",
            },
        );
    });

    test("closeProject returns true on success and false on backend errors", async ({
        mockedInvoker,
        sessionManager,
    }) => {
        mockCloseProject(mockedInvoker);
        const success = await sessionManager.closeProject();

        mockedInvoker.mockCommand(CommandNames.Project.Close, async () => {
            throw new Error("close failed");
        });
        const errorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => undefined);
        const failure = await sessionManager.closeProject();

        expect(success).toBe(true);
        expect(failure).toBe(false);
        expect(errorSpy).toHaveBeenCalled();
    });

    test("updateProject returns null when name is null without invoking backend", async ({
        mockedInvoker,
        sessionManager,
    }) => {
        const response = await sessionManager.updateProject({ name: null });

        expect(response).toBeNull();
        expect(mockedInvoker.spy).not.toHaveBeenCalled();
    });

    test("getProject returns null and logs when backend invocation throws", async ({
        mockedInvoker,
        sessionManager,
    }) => {
        mockedInvoker.mockCommand(CommandNames.Project.Get, async () => {
            throw new Error("boom");
        });
        const errorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => undefined);

        const response = await sessionManager.getProject();

        expect(response).toBeNull();
        expect(errorSpy).toHaveBeenCalled();
        expectInvokePayloadMatch(
            mockedInvoker.spy.mock.calls,
            CommandNames.Project.Get,
            {},
        );
    });
});
