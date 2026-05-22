import { describe, expect, it, vi } from "vitest";

import { EntryType } from "@/constants";
import { Language, Person } from "@/models";
import { EntryInfoService } from "@/ui/centre/entry-editor/entry-info-service.svelte";
import { PropertyEditorService } from "@/ui/centre/entry-editor/property-editor/property-editor-service.svelte";

describe("PropertyEditorService", () => {
    it("initializes with default state and identity", () => {
        const info = new EntryInfoService(42);
        const service = new PropertyEditorService({ info });

        expect(service.id).toBe("property-editor-42");
        expect(service.entity).toBeNull();
        expect(service.fieldData).toStrictEqual([]);
        expect(service.changed).toBe(false);
        expect(service.tableService).toBe(service.table);
    });

    it("loads person properties, wires model field data, and updates through field setter", () => {
        const info = new EntryInfoService(7);
        info.entryType = EntryType.Person;
        const service = new PropertyEditorService({ info });

        service.load({ name: "Ada" });

        expect(service.entity).toBeInstanceOf(Person);
        expect(service.fieldData).toHaveLength(1);
        expect(service.tableService.rows).toBe(service.fieldData);
        expect(service.changed).toBe(false);

        const nameField = service.fieldData[0] as {
            getValue: () => string;
            setValue: (value: string) => void;
        };

        expect(nameField.getValue()).toBe("Ada");

        nameField.setValue("Ada Lovelace");

        expect(nameField.getValue()).toBe("Ada Lovelace");
        expect((service.entity as Person).toJSON()).toStrictEqual({
            name: "Ada Lovelace",
        });
    });

    it("forwards entity onChange to service onChange and marks state as changed", () => {
        const info = new EntryInfoService(13);
        info.entryType = EntryType.Person;
        const service = new PropertyEditorService({ info });
        const onChange = vi.fn();
        service.onChange.subscribe(onChange);

        service.load({ name: "Alice" });
        const nameField = service.fieldData[0] as {
            setValue: (value: string) => void;
        };

        nameField.setValue("Alicia");

        expect(service.changed).toBe(true);
        expect(onChange).toHaveBeenCalledOnce();
        expect(onChange).toHaveBeenCalledWith({
            id: 13,
            propertiesChanged: true,
        });
    });

    it("supports resetting changed state after edits", () => {
        const info = new EntryInfoService(3);
        info.entryType = EntryType.Person;
        const service = new PropertyEditorService({ info });

        service.load({ name: "Bob" });
        (
            service.fieldData[0] as { setValue: (value: string) => void }
        ).setValue("Bobby");

        expect(service.changed).toBe(true);

        service.changed = false;

        expect(service.changed).toBe(false);
    });

    it("loads language properties with language entity and empty field rows", () => {
        const info = new EntryInfoService(8);
        info.entryType = EntryType.Language;
        const service = new PropertyEditorService({ info });

        service.load({});

        expect(service.entity).toBeInstanceOf(Language);
        expect(service.fieldData).toStrictEqual([]);
        expect(service.tableService.rows).toStrictEqual([]);
        expect(service.changed).toBe(false);
    });

    it("ignores load when entry type is not supported", () => {
        const info = new EntryInfoService(99);
        const service = new PropertyEditorService({ info });
        const onChange = vi.fn();
        service.onChange.subscribe(onChange);

        service.load({ name: "Ignored" });

        expect(service.entity).toBeNull();
        expect(service.fieldData).toStrictEqual([]);
        expect(service.changed).toBe(false);
        expect(onChange).not.toHaveBeenCalled();
    });
});
