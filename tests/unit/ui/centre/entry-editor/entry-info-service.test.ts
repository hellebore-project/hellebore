import { expect, vi } from "vitest";

import { EntryType } from "@/api";

import { test } from "./fixtures";

test("loads basic entry info", async ({
    entryInfoService,
    entryId,
    entryType,
    entryTitle,
}) => {
    expect(entryInfoService.entryId).toBe(entryId);
    expect(entryInfoService.entryType).toBe(entryType);
    expect(entryInfoService.entryTypeLabel).toBe("Person");
    expect(entryInfoService.title).toBe(entryTitle);
    expect(entryInfoService.titleChanged).toBe(false);
    expect(entryInfoService.isTitleUnique).toBe(true);
    expect(entryInfoService.isTitleValid).toBe(true);
});

test("title-change event is triggered on title change", async ({
    entryInfoService,
}) => {
    const onChangeTitle = vi.fn();
    entryInfoService.onChangeTitle.subscribe(onChangeTitle);

    entryInfoService.title = "Vergil";
    expect(entryInfoService.title).toBe("Vergil");

    expect(onChangeTitle).toHaveBeenCalled();
});

test("title-change event is not triggered when the title is set to the current value", async ({
    entryInfoService,
    entryTitle,
}) => {
    const onChangeTitle = vi.fn();
    entryInfoService.onChangeTitle.subscribe(onChangeTitle);

    entryInfoService.title = entryTitle;
    expect(entryInfoService.title).toBe(entryTitle);

    expect(onChangeTitle).not.toHaveBeenCalled();
});

test("handleSynchronization keeps titleChanged false when incoming title is unchanged", async ({
    entryInfoService,
}) => {
    const onChangeTitle = vi.fn();
    entryInfoService.onChangeTitle.subscribe(onChangeTitle);

    entryInfoService.load("entry1", EntryType.Language, "Greek");
    entryInfoService.titleChanged = true;

    entryInfoService.handleSynchronization("Greek");

    expect(entryInfoService.title).toBe("Greek");
    expect(entryInfoService.titleChanged).toBe(false);
    expect(onChangeTitle).not.toHaveBeenCalled();
});

test("handleSynchronization re-flags and emits when incoming title differs", async ({
    entryInfoService,
}) => {
    const onChangeTitle = vi.fn();
    entryInfoService.onChangeTitle.subscribe(onChangeTitle);

    entryInfoService.load("entry1", EntryType.Language, "Greek");

    entryInfoService.handleSynchronization("Latin");

    expect(entryInfoService.title).toBe("Latin");
    expect(entryInfoService.titleChanged).toBe(true);
    expect(onChangeTitle).toHaveBeenCalledOnce();
    expect(onChangeTitle).toHaveBeenCalledWith({
        id: "entry1",
        titleChanged: true,
        syncImmediately: true,
    });
});
