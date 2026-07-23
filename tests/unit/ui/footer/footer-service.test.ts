import { expect } from "vitest";

import type { SyncEvent } from "@/interface";

import { test } from "./fixtures";

test("project change updates footer text when project is loaded", async ({
    footerManager,
    project,
}) => {
    footerManager.handleProjectChange({
        loaded: true,
        project,
    });

    expect(footerManager.text).toBe(project.name);
});

test("project change clears footer text when project closes", async ({
    footerManager,
    project,
}) => {
    footerManager.handleProjectChange({
        loaded: true,
        project,
    });

    footerManager.handleProjectChange({
        loaded: false,
        project: null,
    });

    expect(footerManager.text).toBe("");
});

test("synchronization with project response refreshes footer text", async ({
    footerManager,
}) => {
    const syncEvent: SyncEvent = {
        project: {
            request: {
                name: "ignored",
            },
            response: {
                project: {
                    id: "project",
                    name: "synced-project",
                },
            },
        },
    };

    footerManager.handleSynchronization(syncEvent);

    expect(footerManager.text).toBe("synced-project");
});

test("synchronization without project payload keeps current text", async ({
    footerManager,
    project,
}) => {
    footerManager.handleProjectChange({
        loaded: true,
        project,
    });

    footerManager.handleSynchronization({});

    expect(footerManager.text).toBe(project.name);
});
