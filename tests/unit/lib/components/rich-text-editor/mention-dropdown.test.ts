import { screen, within } from "@testing-library/svelte";
import { expect } from "vitest";

import { RichTextEditor } from "@/lib/components/rich-text-editor";
import { render } from "@tests/utils";

import { test, getTextNode, getParagraphNodes } from "./fixtures";

test.extend({
    text: "",
})(
    "typing the mention prefix char displays the dropdown",
    async ({ service, user, placeholder }) => {
        const { container } = render(RichTextEditor, { props: { service } });

        const placeholderElement = container.querySelector(
            `[data-placeholder="${placeholder}"]`,
        );
        await user.click(placeholderElement);

        await user.keyboard("@");

        const menu = screen.getByRole("menu");

        within(menu).getByRole("menuitem", { name: "Alpha" });
        within(menu).getByRole("menuitem", { name: "Beta" });
        within(menu).getByRole("menuitem", { name: "Gamma" });
    },
);

test.extend({
    text: "",
})(
    "filter dropdown items based on input",
    async ({ service, user, placeholder }) => {
        const { container } = render(RichTextEditor, { props: { service } });

        const placeholderElement = container.querySelector(
            `[data-placeholder="${placeholder}"]`,
        );
        await user.click(placeholderElement);

        await user.keyboard("@Al");

        const menu = screen.getByRole("menu");

        const alphaItem = within(menu).queryByRole("menuitem", {
            name: "Alpha",
        });
        const betaItem = within(menu).queryByRole("menuitem", { name: "Beta" });
        const gammaItem = within(menu).queryByRole("menuitem", {
            name: "Gamma",
        });

        expect(alphaItem).toBeTruthy();
        expect(betaItem).toBeNull();
        expect(gammaItem).toBeNull();
    },
);

test.extend({
    text: "",
})("select a suggestion with Enter", async ({ service, user, placeholder }) => {
    const { container } = render(RichTextEditor, { props: { service } });

    const placeholderElement = container.querySelector(
        `[data-placeholder="${placeholder}"]`,
    );
    await user.click(placeholderElement);

    await user.keyboard("@[Enter]");

    const node = getTextNode(container, "Alpha");
    expect(node).toBeTruthy();
    expect(node.tagName).toBe("A");
});

test.extend({
    text: "",
})(
    "select a suggestion with a click",
    async ({ service, user, placeholder }) => {
        const { container } = render(RichTextEditor, { props: { service } });

        const placeholderElement = container.querySelector(
            `[data-placeholder="${placeholder}"]`,
        );
        await user.click(placeholderElement);

        await user.keyboard("@");

        const menuItem = screen.getByRole("menuitem", { name: "Gamma" });
        await user.click(menuItem);

        const node = getTextNode(container, "Gamma");
        expect(node).toBeTruthy();
        expect(node.tagName).toBe("A");
    },
);

test.extend({
    text: "",
})(
    "change selected suggestion with arrow keys",
    async ({ service, user, placeholder }) => {
        const { container } = render(RichTextEditor, { props: { service } });

        const placeholderElement = container.querySelector(
            `[data-placeholder="${placeholder}"]`,
        );
        await user.click(placeholderElement);

        await user.keyboard("@[ArrowDown][Enter]");

        const node = getTextNode(container, "Beta");
        expect(node).toBeTruthy();
        expect(node.tagName).toBe("A");
    },
);

test.extend({
    text: "",
})("close dropdown with Backspace", async ({ service, user, placeholder }) => {
    const { container } = render(RichTextEditor, { props: { service } });

    const placeholderElement = container.querySelector(
        `[data-placeholder="${placeholder}"]`,
    );
    await user.click(placeholderElement);

    await user.keyboard("@");

    // HACK: simulating a backspace keypress via a user event doesn't work here
    // due to some jsdom limitation; instead, we use the tiptap API
    service.editor.commands.deleteRange({ from: 1, to: 2 });

    const menu = screen.queryByRole("menu");
    expect(menu).toBeNull();
});
