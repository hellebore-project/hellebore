import { screen } from "@testing-library/svelte";
import { expect, vi } from "vitest";

import { Header } from "@/ui/header";
import { render } from "@tests/utils";

import { test } from "./fixtures";

test("clicking the Home button emits open-home event", async ({
    user,
    headerManager,
}) => {
    const onOpenHome = vi.fn();
    headerManager.onOpenHome.subscribe(onOpenHome);

    render(Header, { props: { service: headerManager } });

    const homeBtn = screen.getByRole("button", { name: "Home" });
    await user.click(homeBtn);

    expect(onOpenHome).toHaveBeenCalledOnce();
});

test("project loaded state controls file menu items", async ({
    headerManager,
    project,
}) => {
    const loadedLabels = headerManager.fileMenuData
        .map((i) => i.label)
        .filter(Boolean);

    expect(loadedLabels).toContain("Close Project");
    expect(loadedLabels).toContain("New Entry");

    headerManager.handleProjectChange({ loaded: false, project: null });

    const unloadedLabels = headerManager.fileMenuData
        .map((i) => i.label)
        .filter(Boolean);

    expect(unloadedLabels).not.toContain("Close Project");
    expect(unloadedLabels).not.toContain("New Entry");

    headerManager.handleProjectChange({ loaded: true, project });
});
