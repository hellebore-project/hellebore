import { expect, vi } from "vitest";

import { test } from "./fixtures";

test("initialize clears project name and file path", async ({
    projectCreatorService,
}) => {
    projectCreatorService.name = "project-a";
    projectCreatorService.dbFilePath = "/tmp/one.db";

    projectCreatorService.initialize();

    expect(projectCreatorService.name).toBe("");
    expect(projectCreatorService.dbFilePath).toBe("");
});

test("submit emits create payload and closes modal", async ({
    projectCreatorService,
}) => {
    const onCreateProject = vi.fn();
    const onClose = vi.fn();

    projectCreatorService.onCreateProject.subscribe(onCreateProject);
    projectCreatorService.onClose.subscribe(onClose);

    projectCreatorService.name = "new-project";
    projectCreatorService.dbFilePath = "/tmp/new-project.db";

    await projectCreatorService.submit();

    expect(onCreateProject).toHaveBeenCalledWith({
        name: "new-project",
        dbFilePath: "/tmp/new-project.db",
    });
    expect(onClose).toHaveBeenCalledOnce();
});
