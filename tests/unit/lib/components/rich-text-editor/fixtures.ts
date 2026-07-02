import { within } from "@testing-library/svelte";
import { JSONContent } from "@tiptap/core";

import { RichTextEditorService } from "@/lib/components/rich-text-editor";
import { test as baseTest } from "@tests/unit/fixtures";
import {
    createDocNode,
    createParagraphNode,
    createTextNode,
} from "@tests/utils/mocks";

export interface TestMentionData {
    foo: string;
}

export interface RichTextEditorTestFixtures {
    placeholder: string;
    mentionItems: string[];
    text: string;
    lines: string[];
    content: JSONContent;
    service: RichTextEditorService<TestMentionData>;
}

export const test = baseTest.extend<RichTextEditorTestFixtures>({
    placeholder: "Enter some text...",
    mentionItems: ["Alpha", "Beta", "Gamma"],
    text: "Hello world",
    lines: async ({ text }, use) => {
        use([text]);
    },
    content: async ({ lines }, use) => {
        const paragraphNodes = lines.map((line) => {
            const textNode = createTextNode(line);
            return createParagraphNode([textNode]);
        });
        const docNode = createDocNode(paragraphNodes);
        use(docNode);
    },
    service: async ({ content, placeholder, mentionItems }, use) => {
        const querier = async (arg: string) => {
            const filteredItems = mentionItems.filter((item) =>
                item.toLowerCase().includes(arg.toLowerCase()),
            );
            return filteredItems.map((item) => ({ label: item, foo: item }));
        };

        const service = new RichTextEditorService<TestMentionData>({
            id: "test-rich-text-editor",
            extensions: {
                placeholder,
                mention: {
                    prefix: "@",
                    querier,
                },
            },
        });

        service.load(content);

        use(service);
    },
});

export function getTextNode(container: HTMLElement, value: string) {
    return within(container).getByText(value);
}

export function getParagraphNodes(container: HTMLElement) {
    return container.querySelectorAll("p");
}
