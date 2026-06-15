import { expect, vi } from "vitest";

import { EntryType, ROOT_FOLDER_ID } from "@/api";

import { test } from "./fixtures";

test("initialize resets title and uniqueness with default location", async ({
    entryCreatorService,
}) => {
    entryCreatorService.entryTitle = "existing";
    entryCreatorService.entryType = EntryType.Person;
    entryCreatorService.folderId = "entry42";
    entryCreatorService.isTitleUnique = false;

    entryCreatorService.initialize();

    expect(entryCreatorService.entryTitle).toBe("");
    expect(entryCreatorService.entryType).toBeNull();
    expect(entryCreatorService.folderId).toBe(ROOT_FOLDER_ID);
    expect(entryCreatorService.isTitleUnique).toBe(true);
});

test("initialize accepts entry type and folder overrides", async ({
    entryCreatorService,
}) => {
    entryCreatorService.initialize(EntryType.Person, "entry9");

    expect(entryCreatorService.entryType).toBe(EntryType.Person);
    expect(entryCreatorService.folderId).toBe("entry9");
    expect(entryCreatorService.entryTitle).toBe("");
    expect(entryCreatorService.isTitleUnique).toBe(true);
});

test("submit emits entry payload and closes on success", async ({
    entryCreatorService,
}) => {
    const created = {
        id: "entry10",
        entityType: EntryType.Person,
        folderId: "entry11",
        title: "new-entry",
    };
    const onCreateEntry = vi.fn().mockResolvedValue(created);
    const onClose = vi.fn();

    entryCreatorService.onCreateEntry.subscribe(onCreateEntry);
    entryCreatorService.onClose.subscribe(onClose);

    entryCreatorService.initialize(EntryType.Person, "entry11");
    entryCreatorService.entryTitle = "new-entry";

    await entryCreatorService.submit();

    expect(onCreateEntry).toHaveBeenCalledWith({
        entryType: EntryType.Person,
        title: "new-entry",
        folderId: "entry11",
    });
    expect(entryCreatorService.isTitleUnique).toBe(true);
    expect(onClose).toHaveBeenCalledOnce();
});

test("submit marks duplicate title and does not close on failure", async ({
    entryCreatorService,
}) => {
    const onCreateEntry = vi.fn().mockResolvedValue(null);
    const onClose = vi.fn();

    entryCreatorService.onCreateEntry.subscribe(onCreateEntry);
    entryCreatorService.onClose.subscribe(onClose);

    entryCreatorService.initialize(EntryType.Person, "entry5");
    entryCreatorService.entryTitle = "duplicate-entry";

    await entryCreatorService.submit();

    expect(onCreateEntry).toHaveBeenCalledWith({
        entryType: EntryType.Person,
        title: "duplicate-entry",
        folderId: "entry5",
    });
    expect(entryCreatorService.isTitleUnique).toBe(false);
    expect(onClose).not.toHaveBeenCalled();
});
