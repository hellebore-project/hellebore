import { describe, expect, vi } from "vitest";

import { TextPropertyFieldData } from "@/interface";

import { test } from "./fixtures";

test("forwards entity onChange to service onChange and marks state as changed", ({
    propertyEditorService,
}) => {
    const onChange = vi.fn();
    propertyEditorService.onChange.subscribe(onChange);

    const nameField = propertyEditorService
        .fieldData[0] as TextPropertyFieldData;
    nameField.setValue("Alicia");

    expect(propertyEditorService.changed).toBe(true);
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith({
        id: "entry",
        propertiesChanged: true,
    });
});

describe("when entry type is not supported", () => {
    test.override({
        // @ts-ignore: TS2322
        entryType: -2,
    });

    test("payload is ignored", ({ propertyEditorService }) => {
        expect(propertyEditorService.entity).toBeNull();
        expect(propertyEditorService.fieldData).toStrictEqual([]);
        expect(propertyEditorService.changed).toBe(false);
    });
});
