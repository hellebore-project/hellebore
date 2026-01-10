import { screen } from "@testing-library/react";
import { expect } from "vitest";

import { HomeManager, Home } from "@/components";
import { test as baseTest } from "@tests/unit/components/fixtures";
import { render } from "@tests/utils/render";
import { mockUpdateProject } from "@tests/utils/mocks";

const test = baseTest.extend<{ homeManager: HomeManager }>({
    homeManager: [
        async ({ clientManager }, use) => {
            const homeManager = clientManager.central.openHome();
            await use(homeManager);
        },
        { auto: true },
    ],
});

test("can render the home view", async ({ homeManager, project }) => {
    render(<Home service={homeManager} />);
    screen.getByDisplayValue(project.name);
});

test("can edit the project name", async ({
    user,
    mockedInvoker,
    homeManager,
    project,
}) => {
    mockUpdateProject(mockedInvoker, { id: project.id });

    render(<Home service={homeManager} />);

    const titleInput = screen.getByDisplayValue(project.name);

    await user.click(titleInput);
    await user.keyboard("[Backspace>14/]");
    await user.keyboard("edited");

    screen.getByDisplayValue("edited");

    expect(homeManager.projectName).toBe("edited");
    mockedInvoker.expectCalled("update_project");
});
