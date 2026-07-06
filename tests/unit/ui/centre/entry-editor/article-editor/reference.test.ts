import { screen } from "@testing-library/svelte";
import { expect } from "vitest";

import { EntryType } from "@/api";
import { ArticleEditor } from "@/ui/centre/entry-editor/article-editor";
import { Centre } from "@/ui/centre";
import {
    createDocNode,
    createParagraphNode,
    createReferenceNode,
    createTextNode,
    mockGetEntryArticle,
} from "@tests/utils/mocks";
import { render } from "@tests/utils";

import { test } from "./fixtures";
import { EntryEditorService } from "@/ui/centre/entry-editor/entry-editor-service.svelte";

test("can insert a reference to another entry", async ({
    user,
    articleEditorService,
    referencedEntryId,
    referencedEntryTitle,
    entryArticleText,
}) => {
    render(ArticleEditor, { props: { service: articleEditorService } });

    const textBox = screen.getByText(entryArticleText);

    await user.click(textBox);
    await user.keyboard(`{ArrowRight>${entryArticleText.length + 1}/}`);
    await user.keyboard(" @mocked-referenced");

    const dropdownItem = screen.getByRole("menuitem", {
        name: referencedEntryTitle,
    });
    await user.click(dropdownItem);

    screen.getByText(entryArticleText);
    screen.getByText(referencedEntryTitle);

    const expectedContent = createDocNode([
        createParagraphNode([
            createTextNode(`${entryArticleText} `),
            createReferenceNode(referencedEntryId, referencedEntryTitle),
            createTextNode(" "),
        ]),
    ]);
    expect(articleEditorService.richText.content).toEqual(expectedContent);
});

test.extend({
    entryArticle: async ({ referencedEntryId, referencedEntryTitle }, use) => {
        const articleContent = createDocNode([
            createParagraphNode([
                createReferenceNode(referencedEntryId, referencedEntryTitle),
            ]),
        ]);
        use(articleContent);
    },
})(
    "can click a reference to navigate to another entry",
    async ({
        mockedInvoker,
        user,
        centralPanelManager,
        referencedEntryId,
        referencedEntryTitle,
    }) => {
        const referencedEntryContent = createDocNode([
            createParagraphNode([
                createTextNode("article of the referenced entry"),
            ]),
        ]);
        mockGetEntryArticle(mockedInvoker, {
            info: {
                id: referencedEntryId,
                entityType: EntryType.Person,
                folderId: "some-folder",
                title: referencedEntryTitle,
            },
            text: referencedEntryContent,
        });

        render(Centre, { props: { service: centralPanelManager } });

        const reference = screen.getByText(referencedEntryTitle);
        await user.click(reference);

        // we *have* to fetch the article-editor service from the central panel manager;
        // the dedicated article-editor service fixture is stale by this point
        const entryEditorService = centralPanelManager.getPanelByIndex(
            0,
        ) as EntryEditorService;
        const articleEditorService = entryEditorService.article;

        screen.getByText("article of the referenced entry");
        expect(articleEditorService.richText.content).toEqual(
            referencedEntryContent,
        );
    },
);
