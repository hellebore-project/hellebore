import { expect, vi } from "vitest";

import { test } from "./fixtures";

test("initialize clears project name and file path", async ({
    projectCreatorService,
}) => {
    projectCreatorService.name = "project-a";
    projectCreatorService.parentFolderPath = "/tmp/one";

    projectCreatorService.initialize();

    expect(projectCreatorService.name).toBe("");
    expect(projectCreatorService.parentFolderPath).toBe("");
});

test("submit emits create payload and closes modal", async ({
    projectCreatorService,
}) => {
    const onCreateProject = vi.fn();
    const onClose = vi.fn();

    projectCreatorService.onCreateProject.subscribe(onCreateProject);
    projectCreatorService.onClose.subscribe(onClose);

    projectCreatorService.name = "new-project";
    projectCreatorService.parentFolderPath = "/tmp";

    await projectCreatorService.submit();

    expect(onCreateProject).toHaveBeenCalledWith({
        name: "new-project",
        folderPath: "/tmp/new-project",
    });
    expect(onClose).toHaveBeenCalledOnce();
});
