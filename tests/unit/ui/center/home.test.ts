import { screen } from "@testing-library/svelte";
import { expect } from "vitest";

import { Home } from "@/ui/centre/home";
import { DomainManager } from "@/services";
import { HomeManager } from "@/ui/centre/home/home-service.svelte";
import { test as baseTest } from "@tests/unit/ui/fixtures";
import { render } from "@tests/utils";

const test = baseTest.extend<{ homeManager: HomeManager }>({
    homeManager: [
        async ({ project }, use) => {
            const homeManager = new HomeManager(new DomainManager());
            homeManager.load({ project });
            await use(homeManager);
        },
        { auto: true },
    ],
});

test("can render the home view", async ({ homeManager, project }) => {
    render(Home, { props: { service: homeManager } });
    screen.getByDisplayValue(project.name);
});

test("can edit the project name", async ({ user, homeManager, project }) => {
    render(Home, { props: { service: homeManager } });

    const titleInput = screen.getByDisplayValue(project.name);

    await user.clear(titleInput);
    await user.type(titleInput, "edited");

    expect(homeManager.projectName).toBe("edited");
});
