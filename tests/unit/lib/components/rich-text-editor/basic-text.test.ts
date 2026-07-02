import { describe, expect } from "vitest";

import { RichTextEditor } from "@/lib/components/rich-text-editor";
import { render } from "@tests/utils";

import { test, getTextNode, getParagraphNodes } from "./fixtures";

test.extend({
    content: null,
})(
    "editor has placeholder when content is empty",
    ({ service, placeholder }) => {
        const { container } = render(RichTextEditor, { props: { service } });

        const placeholderElement = container.querySelector(
            `[data-placeholder="${placeholder}"]`,
        );
        expect(placeholderElement).toBeTruthy();
    },
);

test.extend({
    text: "Hello world",
})("editor displays content", ({ service }) => {
    const { container } = render(RichTextEditor, { props: { service } });

    const textNode = getTextNode(container, "Hello world");
    expect(textNode).toBeTruthy();
});

test.extend({
    text: "Hello",
})("write text with keyboard", async ({ service, user }) => {
    const { container } = render(RichTextEditor, { props: { service } });

    const textNode = getTextNode(container, "Hello");
    await user.click(textNode);
    await user.keyboard("{ArrowRight>6} world");

    const updatedTextNode = getTextNode(container, "Hello world");
    expect(updatedTextNode).toBeTruthy();
});

test.extend({
    text: "Helloworld",
})("add new line by pressing Enter", async ({ service, user }) => {
    const { container } = render(RichTextEditor, { props: { service } });

    const textNode = getTextNode(container, "Helloworld");
    await user.click(textNode);
    await user.keyboard("{ArrowRight>6}[Enter]");

    const paragraphNodes = getParagraphNodes(container);
    expect(paragraphNodes.length).toBe(2);
    expect(paragraphNodes[0].textContent).toBe("Hello");
    expect(paragraphNodes[1].textContent).toBe("world");
});

test.extend({
    text: "Hello world",
})("delete text with Backspace", async ({ service, user }) => {
    const { container } = render(RichTextEditor, { props: { service } });

    const textNode = getTextNode(container, "Hello world");
    await user.click(textNode);
    await user.keyboard("{ArrowRight>12}{Backspace>6}");

    const updatedTextNode = getTextNode(container, "Hello");
    expect(updatedTextNode).toBeTruthy();
});

test.extend({
    lines: ["Hello", " world"],
})("delete line by pressing Backspace", async ({ service, user }) => {
    const { container } = render(RichTextEditor, { props: { service } });

    const textNode = getTextNode(container, "Hello");
    await user.click(textNode);

    // need to use the tiptap API to move the cursor down;
    // codemirror relies on node positions to handle vertical cursor movement,
    // but jsdom doesn't simulate positioning
    service.editor.commands.setTextSelection({ from: 6, to: 6 });
    await user.keyboard("{ArrowRight>7}{Backspace>7}");

    const paragraphNodes = getParagraphNodes(container);
    expect(paragraphNodes.length).toBe(1);
    expect(paragraphNodes[0].textContent).toBe("Hello");
});

test.extend({
    lines: ["Hello", " world"],
})("combine lines by pressing Delete", async ({ service, user }) => {
    const { container } = render(RichTextEditor, { props: { service } });

    const textNode = getTextNode(container, "Hello");
    await user.click(textNode);

    // need to use the tiptap API to move the cursor down;
    // codemirror relies on node positions to handle vertical cursor movement,
    // but jsdom doesn't simulate positioning
    service.editor.commands.setTextSelection({ from: 6, to: 6 });
    await user.keyboard("[Delete]");

    const paragraphNodes = getParagraphNodes(container);
    expect(paragraphNodes.length).toBe(1);
    expect(paragraphNodes[0].textContent).toBe("Hello world");
});

describe("header formatting", () => {
    [1, 2, 3, 4, 5, 6].forEach((level) => {
        test.extend({
            text: "",
        })(
            `write level-${level} header with pound sign(s)`,
            async ({ service, user, placeholder }) => {
                const { container } = render(RichTextEditor, {
                    props: { service },
                });

                const placeholderElement = container.querySelector(
                    `[data-placeholder="${placeholder}"]`,
                );
                await user.click(placeholderElement);
                await user.keyboard(`${"#".repeat(level)} Header`);

                const headerNode = getTextNode(container, "Header");
                expect(headerNode).toBeTruthy();
                expect(headerNode.tagName).toBe(`H${level}`);
            },
        );
    });
});

test.extend({
    text: "",
})("write bold text with ctrl+b", async ({ service, user, placeholder }) => {
    const { container } = render(RichTextEditor, { props: { service } });

    const placeholderElement = container.querySelector(
        `[data-placeholder="${placeholder}"]`,
    );
    await user.click(placeholderElement);
    await user.keyboard("{Control>}b{/Control}Bold text");

    const boldNode = getTextNode(container, "Bold text");
    expect(boldNode).toBeTruthy();
    expect(boldNode.tagName).toBe("STRONG");
});

test.extend({
    text: "",
})("write italic text with ctrl+i", async ({ service, user, placeholder }) => {
    const { container } = render(RichTextEditor, { props: { service } });

    const placeholderElement = container.querySelector(
        `[data-placeholder="${placeholder}"]`,
    );
    await user.click(placeholderElement);
    await user.keyboard("{Control>}i{/Control}Italic text");

    const italicNode = getTextNode(container, "Italic text");
    expect(italicNode).toBeTruthy();
    expect(italicNode.tagName).toBe("EM");
});

test.extend({
    text: "",
})(
    "write underlined text with ctrl+u",
    async ({ service, user, placeholder }) => {
        const { container } = render(RichTextEditor, { props: { service } });

        const placeholderElement = container.querySelector(
            `[data-placeholder="${placeholder}"]`,
        );
        await user.click(placeholderElement);
        await user.keyboard("{Control>}u{/Control}Underlined text");

        const underlinedNode = getTextNode(container, "Underlined text");
        expect(underlinedNode).toBeTruthy();
        expect(underlinedNode.tagName).toBe("U");
    },
);
