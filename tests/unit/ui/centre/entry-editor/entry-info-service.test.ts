import { describe, expect, it, vi } from "vitest";

import { EntryType } from "@/constants";
import { EntryInfoService } from "@/ui/centre/entry-editor/entry-info-service.svelte";

describe("EntryInfoService", () => {
    it("initializes with constructor id and default state", () => {
        const service = new EntryInfoService(42);

        expect(service.entryId).toBe(42);
        expect(service.entryType).toBeNull();
        expect(service.entryTypeLabel).toBeUndefined();
        expect(service.title).toBe("");
        expect(service.isTitleUnique).toBe(true);
        expect(service.isTitleValid).toBe(false);
        expect(service.titleChanged).toBe(false);
    });

    it("updates title and emits change event once for a real change", () => {
        const service = new EntryInfoService(9);
        const onChangeTitle = vi.fn();
        service.onChangeTitle.subscribe(onChangeTitle);

        service.title = "alpha";

        expect(service.title).toBe("alpha");
        expect(service.titleChanged).toBe(true);
        expect(onChangeTitle).toHaveBeenCalledOnce();
        expect(onChangeTitle).toHaveBeenCalledWith({
            id: 9,
            titleChanged: true,
            syncImmediately: true,
        });
    });

    it("does not emit or mark changed when setting the same title", () => {
        const service = new EntryInfoService(5);
        const onChangeTitle = vi.fn();
        service.onChangeTitle.subscribe(onChangeTitle);

        service.title = "";

        expect(service.title).toBe("");
        expect(service.titleChanged).toBe(false);
        expect(onChangeTitle).not.toHaveBeenCalled();
    });

    it("computes title validity from title uniqueness and non-empty value", () => {
        const service = new EntryInfoService(12);

        service.title = "entry";
        expect(service.isTitleValid).toBe(true);

        service.isTitleUnique = false;
        expect(service.isTitleValid).toBe(false);

        service.isTitleUnique = true;
        service.title = "";
        expect(service.isTitleValid).toBe(false);
    });

    it("loads id/type/title without producing a title-change event", () => {
        const service = new EntryInfoService(1);
        const onChangeTitle = vi.fn();
        service.onChangeTitle.subscribe(onChangeTitle);

        service.isTitleUnique = false;
        service.load(44, EntryType.Person, "Ada");

        expect(service.entryId).toBe(44);
        expect(service.entryType).toBe(EntryType.Person);
        expect(service.entryTypeLabel).toBe("Person");
        expect(service.title).toBe("Ada");
        expect(service.isTitleUnique).toBe(true);
        expect(service.isTitleValid).toBe(true);
        expect(onChangeTitle).not.toHaveBeenCalled();
    });

    it("handleSynchronization keeps titleChanged false when incoming title is unchanged", () => {
        const service = new EntryInfoService(7);
        const onChangeTitle = vi.fn();
        service.onChangeTitle.subscribe(onChangeTitle);

        service.load(7, EntryType.Language, "Greek");
        service.titleChanged = true;

        service.handleSynchronization("Greek");

        expect(service.title).toBe("Greek");
        expect(service.titleChanged).toBe(false);
        expect(onChangeTitle).not.toHaveBeenCalled();
    });

    it("handleSynchronization re-flags and emits when incoming title differs", () => {
        const service = new EntryInfoService(7);
        const onChangeTitle = vi.fn();
        service.onChangeTitle.subscribe(onChangeTitle);

        service.load(7, EntryType.Language, "Greek");

        service.handleSynchronization("Latin");

        expect(service.title).toBe("Latin");
        expect(service.titleChanged).toBe(true);
        expect(onChangeTitle).toHaveBeenCalledOnce();
        expect(onChangeTitle).toHaveBeenCalledWith({
            id: 7,
            titleChanged: true,
            syncImmediately: true,
        });
    });
});
