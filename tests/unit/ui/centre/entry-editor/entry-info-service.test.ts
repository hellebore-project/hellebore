import { describe, expect, it, vi } from "vitest";

import { EntryType } from "@/api";
import { EntryInfoService } from "@/ui/centre/entry-editor/entry-info-service.svelte";

describe("EntryInfoService", () => {
    it("does not emit or mark changed when setting the same title", () => {
        const service = new EntryInfoService("entry5");
        const onChangeTitle = vi.fn();
        service.onChangeTitle.subscribe(onChangeTitle);

        service.title = "";

        expect(service.title).toBe("");
        expect(service.titleChanged).toBe(false);
        expect(onChangeTitle).not.toHaveBeenCalled();
    });

    it("loads id/type/title without producing a title-change event", () => {
        const service = new EntryInfoService("entry1");
        const onChangeTitle = vi.fn();
        service.onChangeTitle.subscribe(onChangeTitle);

        service.isTitleUnique = false;
        service.load("entry44", EntryType.Person, "Ada");

        expect(service.entryId).toBe("entry44");
        expect(service.entryType).toBe(EntryType.Person);
        expect(service.entryTypeLabel).toBe("Person");
        expect(service.title).toBe("Ada");
        expect(service.isTitleUnique).toBe(true);
        expect(service.isTitleValid).toBe(true);
        expect(onChangeTitle).not.toHaveBeenCalled();
    });

    it("handleSynchronization keeps titleChanged false when incoming title is unchanged", () => {
        const service = new EntryInfoService("entry7");
        const onChangeTitle = vi.fn();
        service.onChangeTitle.subscribe(onChangeTitle);

        service.load("entry7", EntryType.Language, "Greek");
        service.titleChanged = true;

        service.handleSynchronization("Greek");

        expect(service.title).toBe("Greek");
        expect(service.titleChanged).toBe(false);
        expect(onChangeTitle).not.toHaveBeenCalled();
    });

    it("handleSynchronization re-flags and emits when incoming title differs", () => {
        const service = new EntryInfoService("entry7");
        const onChangeTitle = vi.fn();
        service.onChangeTitle.subscribe(onChangeTitle);

        service.load("entry7", EntryType.Language, "Greek");

        service.handleSynchronization("Latin");

        expect(service.title).toBe("Latin");
        expect(service.titleChanged).toBe(true);
        expect(onChangeTitle).toHaveBeenCalledOnce();
        expect(onChangeTitle).toHaveBeenCalledWith({
            id: "entry7",
            titleChanged: true,
            syncImmediately: true,
        });
    });
});
