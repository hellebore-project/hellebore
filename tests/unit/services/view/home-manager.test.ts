import { expect } from "vitest";

import { test } from "@tests/unit/base";
import { mockUpdateProject } from "@tests/utils/mocks/session-manager";

test("update the project name", async ({ service, project }) => {
    const sessionManager = service.domain.session;

    const spy = mockUpdateProject({ manager: sessionManager, id: project.id });

    const homeManager = service.view.home;
    homeManager.initialize(project.name);
    homeManager.projectName = "mocked-project-2";

    expect(homeManager.projectName).toBe("mocked-project-2");
    expect(spy).toHaveBeenCalledExactlyOnceWith("mocked-project-2");
});
