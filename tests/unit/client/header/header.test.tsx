import { screen } from "@testing-library/react";
import { describe, expect } from "vitest";

import { Center, Header, Modal } from "@/client";
import { test } from "@tests/unit/client/fixtures";
import { mockCloseProject } from "@tests/utils/mocks";
import { render } from "@tests/utils/render";

test("clicking the Home button opens the home view", async ({
    user,
    clientManager,
    project,
}) => {
    clientManager.central.openSettings();

    render(
        <>
            <Header service={clientManager.header} />
            <Center service={clientManager.central.activePanelService} />
        </>,
    );

    const homeBtn = screen.getByRole("button", { name: "Home" });
    await user.click(homeBtn);

    render(<Center service={clientManager.central.activePanelService} />);

    screen.getByDisplayValue(project.name);
});

test("clicking the New Project button opens the project creator", async ({
    user,
    clientManager,
}) => {
    render(
        <>
            <Header service={clientManager.header} />
            <Modal service={clientManager.modal} />
        </>,
    );

    const appBtn = screen.getByRole("button", { name: "File" });
    await user.click(appBtn);

    const newProjectBtn = screen.getByRole("menuitem", { name: "New Project" });
    await user.click(newProjectBtn);

    screen.getByText("Create a new project");
});

test("clicking the Open Project button loads another project", async ({
    clientManager,
}) => {
    render(<Header service={clientManager.header} />);
    // TODO: not clear how to mock the `open` function in the tauri API
});

describe("clicking the Close Project button", () => {
    test("hides the Close Project button", async ({
        user,
        mockedInvoker,
        clientManager,
    }) => {
        mockCloseProject(mockedInvoker);

        render(<Header service={clientManager.header} />);

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
    clientManager,
}) => {
    render(
        <>
            <Header service={clientManager.header} />
            <Modal service={clientManager.modal} />
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
    clientManager,
}) => {
    render(
        <>
            <Header service={clientManager.header} />
            <Center service={clientManager.central.activePanelService} />
        </>,
    );

    const appBtn = screen.getByRole("button", { name: "File" });
    await user.click(appBtn);

    const settingsBtn = screen.getByRole("menuitem", { name: "Settings" });
    await user.click(settingsBtn);

    render(<Center service={clientManager.central.activePanelService} />);

    screen.getByText("Settings");
});
