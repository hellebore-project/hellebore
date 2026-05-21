import { expect } from "vitest";

import type { SyncEvent } from "@/interface";

import { test } from "./fixtures";

test("starts with empty footer text", async ({ standaloneFooterManager }) => {
    expect(standaloneFooterManager.text).toBe("");
});

test("project change updates footer text when project is loaded", async ({
    standaloneFooterManager,
    project,
}) => {
    standaloneFooterManager.handleProjectChange({
        loaded: true,
        project,
    });

    expect(standaloneFooterManager.text).toBe(project.name);
});

test("project change clears footer text when project closes", async ({
    standaloneFooterManager,
    project,
}) => {
    standaloneFooterManager.handleProjectChange({
        loaded: true,
        project,
    });

    standaloneFooterManager.handleProjectChange({
        loaded: false,
        project: null,
    });

    expect(standaloneFooterManager.text).toBe("");
});

test("synchronization with project response refreshes footer text", async ({
    standaloneFooterManager,
}) => {
    const syncEvent: SyncEvent = {
        project: {
            request: {
                name: "ignored",
            },
            response: {
                project: {
                    id: 7,
                    name: "synced-project",
                },
            },
        },
    };

    standaloneFooterManager.handleSynchronization(syncEvent);

    expect(standaloneFooterManager.text).toBe("synced-project");
});

test("synchronization without project payload keeps current text", async ({
    standaloneFooterManager,
    project,
}) => {
    standaloneFooterManager.handleProjectChange({
        loaded: true,
        project,
    });

    standaloneFooterManager.handleSynchronization({});

    expect(standaloneFooterManager.text).toBe(project.name);
});
