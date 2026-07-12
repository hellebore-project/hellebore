import { screen } from "@testing-library/svelte";

import { PropertyEditor } from "@/ui/centre/entry-editor/property-editor";
import { render } from "@tests/utils";

import { test } from "./fixtures";

test("property editor displays entry title field", async ({
    propertyEditorService,
    entryTitle,
}) => {
    render(PropertyEditor, { props: { service: propertyEditorService } });

    screen.getByDisplayValue(entryTitle);
});

test("entry title can be edited from the property editor", async ({
    user,
    propertyEditorService,
    entryTitle,
}) => {
    render(PropertyEditor, { props: { service: propertyEditorService } });

    const titleInput = screen.getByDisplayValue(entryTitle);
    await user.click(titleInput);

    await user.keyboard("{ArrowRight>20} edited");

    const expectedTitle = entryTitle + " edited";
    screen.getByDisplayValue(expectedTitle);
});
