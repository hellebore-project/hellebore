import { screen } from "@testing-library/svelte";
import { expect } from "vitest";

import { ModalType } from "@/constants";
import { EntryType } from "@/api";
import { Modal } from "@/ui/modal";
import { render } from "@tests/utils/render";

import { test } from "./fixtures";

test("open modal", async ({ modalManager }) => {
    render(Modal, { props: { service: modalManager } });

    modalManager.openProjectCreator();

    expect(await screen.findByText("Create a new project")).toBeTruthy();

    expect(modalManager.open).toBe(true);
    expect(modalManager.modalKey).toBe(ModalType.ProjectCreator);
    expect(modalManager.content).toBeTruthy();
});

test("close modal", async ({ user, modalManager }) => {
    render(Modal, { props: { service: modalManager } });

    modalManager.openProjectCreator();

    const closeButton = await screen.findByRole("button", { name: "Close" });
    await user.click(closeButton);

    expect(modalManager.open).toBe(false);
    expect(modalManager.modalKey).toBeNull();
    expect(modalManager.content).toBeNull();

    expect(screen.queryByText("Create a new project")).toBeNull();
});

test("switch between modals", async ({ modalManager, folderId }) => {
    render(Modal, { props: { service: modalManager } });

    modalManager.openProjectCreator();

    expect(await screen.findByText("Create a new project")).toBeTruthy();

    modalManager.openEntryCreator({
        entryType: EntryType.Person,
        folderId,
    });

    expect(await screen.findByText("Create a new entry")).toBeTruthy();
});
