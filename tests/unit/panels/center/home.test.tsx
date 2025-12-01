import { screen } from "@testing-library/react";
import { expect } from "vitest";

import { Home } from "@/client/ui/center/home";
import { test } from "@tests/unit/fixtures";
import { render } from "@tests/utils/render";
import { mockUpdateProject } from "@tests/utils/mocks/backend/session";

test("can render the home view", async ({ service, project }) => {
    const homeService = service.central.openHome();

    render(<Home service={homeService} />);

    screen.getByDisplayValue(project.name);
});

test("can edit the project name", async ({
    mockedInvoker,
    user,
    service,
    project,
}) => {
    mockUpdateProject(mockedInvoker, { id: project.id });

    const homeService = service.central.openHome();

    render(<Home service={homeService} />);

    const titleInput = screen.getByDisplayValue(project.name);

    await user.click(titleInput);
    await user.keyboard("[Backspace>14/]");
    await user.keyboard("edited");

    screen.getByDisplayValue("edited");

    expect(homeService?.projectName).toBe("edited");
    mockedInvoker.expectCalled("update_project");
});
