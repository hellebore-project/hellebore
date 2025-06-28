import { screen } from "@testing-library/react";
import { expect } from "vitest";

import { Home } from "@/panels/center/home";
import { test } from "@tests/unit/base";
import { render } from "@tests/utils/render";
import { mockUpdateProject } from "@tests/utils/mocks/session-manager";

test("can render the home view", async ({ service, project }) => {
    service.view.home.initialize(project.name);

    render(<Home />);

    let titleField = screen.getByDisplayValue(project.name);
    expect(titleField).toBeTruthy();
});

test("home service controls the project name", async ({ service, project }) => {
    mockUpdateProject({ manager: service.domain.session, id: project.id });

    service.view.home.initialize(project.name);
    service.view.home.projectName = "mocked-project-2";

    render(<Home />);

    let titleField: HTMLInputElement =
        screen.getByDisplayValue("mocked-project-2");
    expect(titleField).toBeTruthy();
});
