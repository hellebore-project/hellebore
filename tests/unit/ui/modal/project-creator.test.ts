import { screen, waitFor } from "@testing-library/svelte";
import { expect } from "vitest";

import { Modal, ProjectCreator } from "@/ui/modal";
import { render } from "@tests/utils/render";
import { mockCreateProject } from "@tests/utils/mocks";

import { test } from "./fixtures";

test("modal title", async ({ projectCreatorService }) => {
    render(ProjectCreator, { props: { service: projectCreatorService } });
    expect(screen.getByText("Create a new project")).toBeTruthy();
});

test("closing the form resets the fields", async ({
    user,
    mockedInvoker,
    modalManager,
    projectCreatorService,
}) => {
    mockCreateProject(mockedInvoker, "new-project");

    render(Modal, { props: { service: modalManager } });

    let nameInput = screen.getByLabelText("Name");
    await user.click(nameInput);
    await user.keyboard("New Project");

    // not sure how to mock the file explorer, so just set the path directly
    projectCreatorService.parentFolderPath = "/tmp/project";

    const closeButton = await screen.findByRole("button", { name: "Close" });
    await user.click(closeButton);

    modalManager.openProjectCreator();

    nameInput = await screen.findByLabelText("Name");
    expect(nameInput.textContent).toBe("");

    const pathInput = screen.getByLabelText("Location");
    expect(pathInput.textContent).toBe("");
});

test("submit form", async ({
    user,
    mockedInvoker,
    clientManager,
    projectCreatorService,
}) => {
    mockCreateProject(mockedInvoker, "new-project");

    render(ProjectCreator, { props: { service: projectCreatorService } });

    const nameInput = screen.getByLabelText("Name");
    await user.click(nameInput);
    await user.keyboard("New Project");

    // not sure how to mock the file explorer, so just set the path directly
    projectCreatorService.parentFolderPath = "/tmp/project";
    const pathInput = await screen.findByDisplayValue("/tmp/project");
    expect(pathInput).toBeTruthy();

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await user.click(submitButton);

    expect(clientManager.data.project?.id).toBe("new-project");
    expect(clientManager.data.project?.name).toBe("New Project");

    expect(screen.queryByText("Create a new project")).toBeNull();
});
