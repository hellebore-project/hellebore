import { screen } from "@testing-library/react";
import { expect } from "vitest";

import { PropertyTable } from "@/client";
import { EntityType } from "@/domain";
import { render } from "@tests/utils/render";

import { test } from "./fixtures";

test.scoped({
    entryType: EntityType.PERSON,
    entryProperties: async ({}, use) => {
        const props = { name: "mocked-name" };
        return use(props);
    },
});

test("displays person's name", async ({
    propertyEditorService,
    entryProperties,
}) => {
    render(<PropertyTable service={propertyEditorService} />);
    screen.getByText("Full Name");
    screen.getByDisplayValue(entryProperties["name"]);
});

test("edit person's name", async ({
    user,
    propertyEditorService,
    entryProperties,
}) => {
    render(<PropertyTable service={propertyEditorService} />);

    const name = entryProperties["name"];
    let textField = screen.getByDisplayValue(name);

    await user.click(textField);
    await user.keyboard("-edited");

    const modifiedName = `${name}-edited`;
    textField = screen.getByDisplayValue(modifiedName);
    expect(propertyEditorService.getProperty("name")).toBe(modifiedName);
});
