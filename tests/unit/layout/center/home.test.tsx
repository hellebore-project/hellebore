import { screen } from "@testing-library/react";
import { expect } from "vitest";

import { Home } from "@/layout/center/home";
import { test } from "@tests/unit/base";
import { render } from "@tests/utils/render";

test("can render the home view", async ({ service }) => {
    service.view.home.initialize("Name of project");
    render(<Home />);
    let titleField = screen.getByDisplayValue("Name of project");
    expect(titleField).toBeTruthy();
});
