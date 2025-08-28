import { screen } from "@testing-library/react";
import { expect } from "vitest";

import { Home } from "@/panels/center/home";
import { test } from "@tests/unit/base";
import { render } from "@tests/utils/render";
import { mockUpdateProject } from "@tests/utils/mocks/session-manager";

test("can render the home view", async ({ project }) => {
    render(<Home />);

    screen.getByDisplayValue(project.name);
});

test("can edit the project name", async ({ user, service, project }) => {
    const spy = mockUpdateProject({
        manager: service.domain.session,
        id: project.id,
    });

    service.view.home.initialize(project.name);

    render(<Home />);

    let titleInput = screen.getByDisplayValue(project.name);

    await user.click(titleInput);
    await user.keyboard("[Backspace>14/]");
    await user.keyboard("edited");

    screen.getByDisplayValue("edited");

    expect(service.view.home.projectName).toBe("edited");
    expect(spy).toHaveBeenCalledWith("edited");
});
