import { screen } from "@testing-library/svelte";

import { Footer } from "@/ui/footer";
import { render } from "@tests/utils";

import { test } from "./fixtures";

test("footer displays project name", async ({ footerManager, project }) => {
    render(Footer, { props: { service: footerManager } });
    screen.getByText(project.name);
});
