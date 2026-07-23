import { screen, waitFor } from "@testing-library/svelte";
import { describe, expect, vi } from "vitest";

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

describe("file menu", () => {
    const VISIBLE_WHEN_OPEN = [
        "New Project",
        "Open Project",
        "Close Project",
        "New Entry",
        "Settings",
    ];

    const VISIBLE_WHEN_CLOSED = ["New Project", "Open Project", "Settings"];
    const INVISIBLE_WHEN_CLOSED = ["Close Project", "New Entry"];

    test("project load state controls file menu item visibility", async ({
        user,
        headerManager,
    }) => {
        render(Header, { props: { service: headerManager } });

        const fileButton = screen.getByText("File");
        await user.click(fileButton);

        for (const label of VISIBLE_WHEN_OPEN) {
            expect(screen.queryByText(label)).toBeTruthy();
        }

        headerManager.handleProjectChange({ loaded: false, project: null });

        await user.click(fileButton);
        await user.click(fileButton);

        for (const label of VISIBLE_WHEN_CLOSED) {
            expect(screen.queryByText(label)).toBeTruthy();
        }
        for (const label of INVISIBLE_WHEN_CLOSED) {
            expect(screen.queryByText(label)).toBeFalsy();
        }
    });
});

test("header search field is only visible when project is loaded", async ({
    headerManager,
    project,
}) => {
    render(Header, { props: { service: headerManager } });

    headerManager.handleProjectChange({ loaded: true, project });
    await waitFor(() => {
        expect(screen.getByRole("combobox")).toBeTruthy();
    });

    headerManager.handleProjectChange({
        loaded: false,
        project: null,
    });
    await waitFor(() => {
        expect(screen.queryByRole("combobox")).toBeNull();
    });
});
