import { screen } from "@testing-library/svelte";
import { expect } from "vitest";

import { PropertyTable } from "@/ui/centre/entry-editor/property-editor/property-table";
import { render } from "@tests/utils";

import { test } from "./fixtures";

test.override({
    entryProperties: async ({}, use) => {
        await use({ name: "mocked-name" });
    },
});

test("displays person's name", async ({
    propertyEditorService,
    entryProperties,
}) => {
    render(PropertyTable, { props: { service: propertyEditorService.table } });
    screen.getByText("Full Name");
    screen.getByDisplayValue(entryProperties.name);
});

test("edit person's name", async ({
    user,
    propertyEditorService,
    entryProperties,
}) => {
    render(PropertyTable, { props: { service: propertyEditorService.table } });

    const name = entryProperties.name;
    const textField = screen.getByDisplayValue(name);

    await user.click(textField);
    await user.type(textField, "-edited");

    expect(propertyEditorService.changed).toBe(true);

    const modifiedName = `${name}-edited`;
    screen.getByDisplayValue(modifiedName);
    expect(propertyEditorService.entity?.toJSON()).toStrictEqual({
        name: modifiedName,
    });
});
