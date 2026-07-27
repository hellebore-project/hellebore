import { screen } from "@testing-library/svelte";
import { expect, vi } from "vitest";

import { EntryType, ROOT_FOLDER_ID } from "@/api";
import { Modal } from "@/ui/modal";
import { mockCreateEntry } from "@tests/utils/mocks";
import { render } from "@tests/utils/render";

import { test } from "./fixtures";

test("modal title", async ({ modalManager, entryCreatorService }) => {
    render(Modal, { props: { service: modalManager } });
    screen.getByText("Create a new entry");
});

test("re-opening the modal resets the form fields", async ({
    user,
    modalManager,
}) => {
    modalManager.openEntryCreator({});

    render(Modal, { props: { service: modalManager } });

    let entityInput = screen.getByRole("button", { name: "Entity" });
    await user.click(entityInput);

    const personOption = await screen.findByRole("option", { name: "Person" });
    await user.click(personOption);

    let titleInput = screen.getByLabelText("Title");
    await user.click(titleInput);
    await user.keyboard("some title");

    const closeButton = await screen.findByRole("button", { name: "Close" });
    await user.click(closeButton);

    modalManager.openEntryCreator({});

    entityInput = await screen.findByLabelText("Entity");
    expect(entityInput.textContent).toBe("Select an entity type ");

    titleInput = screen.getByLabelText("Title");
    expect(titleInput.textContent).toBe("");
});

test("submit form", async ({ user, modalManager, entryCreatorService }) => {
    const onCreateEntry = vi.fn();
    entryCreatorService.onCreateEntry.subscribe(onCreateEntry);

    render(Modal, { props: { service: modalManager } });

    const entityInput = screen.getByRole("button", { name: "Entity" });
    await user.click(entityInput);

    const personOption = await screen.findByRole("option", { name: "Person" });
    await user.click(personOption);

    const titleInput = screen.getByLabelText("Title");
    await user.click(titleInput);
    await user.keyboard("some title");

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await user.click(submitButton);

    expect(onCreateEntry).toHaveBeenCalledWith({
        entryType: EntryType.Person,
        title: "some title",
        folderId: ROOT_FOLDER_ID,
    });
});

test.extend({
    entryType: EntryType.Person,
})(
    "submit with entry type preset",
    async ({ user, modalManager, entryCreatorService }) => {
        const onCreateEntry = vi.fn();
        entryCreatorService.onCreateEntry.subscribe(onCreateEntry);

        render(Modal, { props: { service: modalManager } });

        const entityInput = screen.getByRole("button", { name: "Entity" });
        expect(entityInput.textContent).toBe("Person ");

        const titleInput = screen.getByLabelText("Title");
        await user.click(titleInput);
        await user.keyboard("some title");

        const submitButton = screen.getByRole("button", { name: "Submit" });
        await user.click(submitButton);

        expect(onCreateEntry).toHaveBeenCalledWith({
            entryType: EntryType.Person,
            title: "some title",
            folderId: ROOT_FOLDER_ID,
        });
    },
);

test.extend({
    entryType: EntryType.Person,
    folderId: "test-folder",
})(
    "submit with folder ID preset",
    async ({
        user,
        modalManager,
        entryCreatorService,
        folderId,
        entryType,
    }) => {
        const onCreateEntry = vi.fn();
        entryCreatorService.onCreateEntry.subscribe(onCreateEntry);

        render(Modal, { props: { service: modalManager } });

        const titleInput = screen.getByLabelText("Title");
        await user.click(titleInput);
        await user.type(titleInput, "some title");

        const submitButton = screen.getByRole("button", { name: "Submit" });
        await user.click(submitButton);

        expect(onCreateEntry).toHaveBeenCalledWith({
            entryType,
            title: "some title",
            folderId,
        });
    },
);

test.extend({
    entryType: EntryType.Person,
})(
    "submit marks duplicate title and does not close on failure",
    async ({ user, mockedInvoker, modalManager, entryCreatorService }) => {
        mockCreateEntry({ mockedInvoker, error: "Duplicate title" });

        render(Modal, { props: { service: modalManager } });

        const titleInput = screen.getByLabelText("Title");
        await user.click(titleInput);
        await user.keyboard("some title");

        const submitButton = screen.getByRole("button", { name: "Submit" });
        await user.click(submitButton);

        expect(entryCreatorService.isTitleUnique).toBe(false);

        screen.getByText("Duplicate title"); // error message should be displayed
        screen.getByText("Create a new entry"); // modal should still be open
    },
);
