import { screen } from "@testing-library/react";
import { describe, expect } from "vitest";

import { Modal } from "@/client/ui/overlays";
import { Center, Header } from "@/client";
import { test } from "@tests/unit/base";
import { render } from "@tests/utils/render";
import { mockCloseProject } from "@tests/utils/mocks/backend/session";

test("clicking the Home button opens the home view", async ({
    service,
    user,
    project,
}) => {
    service.openSettings();

    render(
        <>
            <Header />
            <Center />
        </>,
    );

    const homeBtn = screen.getByRole("button", { name: "Home" });
    await user.click(homeBtn);

    screen.getByDisplayValue(project.name);
});

test("clicking the New Project button opens the project creator", async ({
    user,
}) => {
    render(
        <>
            <Header />
            <Modal />
        </>,
    );

    const appBtn = screen.getByRole("button", { name: "File" });
    await user.click(appBtn);

    const newProjectBtn = screen.getByRole("menuitem", { name: "New Project" });
    await user.click(newProjectBtn);

    screen.getByText("Create a new project");
});

test("clicking the Open Project button loads another project", async () => {
    render(<Header />);
    // TODO: not clear how to mock the `open` function in the tauri API
});

describe("clicking the Close Project button", () => {
    test("hides the Close Project button", async ({ mockedInvoker, user }) => {
        mockCloseProject(mockedInvoker);

        render(<Header />);

        const appBtn = screen.getByRole("button", { name: "File" });
        await user.click(appBtn);

        const newProjectBtn = screen.getByRole("menuitem", {
            name: "Close Project",
        });
        await user.click(newProjectBtn);

        expect(
            screen.queryByRole("menuitem", { name: "Close Project" }),
        ).toBeNull();
    });
});

test("clicking the New Entry button opens the entry creator", async ({
    user,
}) => {
    render(
        <>
            <Header />
            <Modal />
        </>,
    );

    const appBtn = screen.getByRole("button", { name: "File" });
    await user.click(appBtn);

    const newProjectBtn = screen.getByRole("menuitem", { name: "New Entry" });
    await user.click(newProjectBtn);

    screen.getByText("Create a new entry");
});

test("clicking the Settings button opens the settings editor", async ({
    user,
}) => {
    render(
        <>
            <Header />
            <Center />
        </>,
    );

    const appBtn = screen.getByRole("button", { name: "File" });
    await user.click(appBtn);

    const newProjectBtn = screen.getByRole("menuitem", { name: "Settings" });
    await user.click(newProjectBtn);

    screen.getByText("Settings");
});
