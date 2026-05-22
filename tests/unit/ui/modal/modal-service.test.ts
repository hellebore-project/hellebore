import { expect, vi } from "vitest";

import { EntryType, ModalType } from "@/constants";

import { test } from "./fixtures";

test("opens project creator modal and resets lifecycle state", async ({
    standaloneModalManager,
}) => {
    standaloneModalManager.openProjectCreator();

    expect(standaloneModalManager.open).toBe(true);
    expect(standaloneModalManager.modalKey).toBe(ModalType.ProjectCreator);
    expect(standaloneModalManager.content).toBeTruthy();

    standaloneModalManager.onOpenChange(false);

    expect(standaloneModalManager.open).toBe(false);
    expect(standaloneModalManager.modalKey).toBeNull();
    expect(standaloneModalManager.content).toBeNull();
});

test("content close event closes the current modal", async ({
    standaloneModalManager,
}) => {
    standaloneModalManager.openProjectCreator();
    const content = standaloneModalManager.content;

    expect(content).toBeTruthy();

    content?.onClose.produce();

    expect(standaloneModalManager.open).toBe(false);
    expect(standaloneModalManager.modalKey).toBeNull();
    expect(standaloneModalManager.content).toBeNull();
});

test("switches from project to entry creator and wires create entry broker", async ({
    standaloneModalManager,
}) => {
    const onCreateEntry = vi.fn().mockResolvedValue({
        id: 4,
        entityType: EntryType.Person,
        folderId: 8,
        title: "created-entry",
    });
    standaloneModalManager.onCreateEntry.subscribe(onCreateEntry);

    standaloneModalManager.openProjectCreator();
    standaloneModalManager.openEntryCreator({
        entryType: EntryType.Person,
        folderId: 8,
    });

    const content = standaloneModalManager.content;
    expect(standaloneModalManager.modalKey).toBe(ModalType.EntryCreator);
    expect(content).toBeTruthy();

    if (content) {
        content.entryTitle = "created-entry";
        await content.submit();
    }

    expect(onCreateEntry).toHaveBeenCalledWith({
        entryType: EntryType.Person,
        title: "created-entry",
        folderId: 8,
    });
    expect(standaloneModalManager.open).toBe(false);
    expect(standaloneModalManager.content).toBeNull();
});

test("keeps modal open when entry creation fails validation", async ({
    standaloneModalManager,
}) => {
    const onCreateEntry = vi.fn().mockResolvedValue(null);
    standaloneModalManager.onCreateEntry.subscribe(onCreateEntry);

    standaloneModalManager.openEntryCreator({
        entryType: EntryType.Person,
        folderId: 2,
    });

    const content = standaloneModalManager.content;
    expect(content).toBeTruthy();

    if (content) {
        content.entryTitle = "duplicate-title";
        await content.submit();

        expect(content.isTitleUnique).toBe(false);
    }

    expect(standaloneModalManager.open).toBe(true);
    expect(standaloneModalManager.modalKey).toBe(ModalType.EntryCreator);
    expect(onCreateEntry).toHaveBeenCalledWith({
        entryType: EntryType.Person,
        title: "duplicate-title",
        folderId: 2,
    });
});
