import type { JSONContent } from "@tiptap/core";
import { beforeEach, describe, expect, vi } from "vitest";

import { EntryType } from "@/api";
import { MultiEventProducer } from "@/utils/event-producer";
import { EntryInfoService } from "@/ui/centre/entry-editor/entry-info-service.svelte";
import { ARTICLE_REFERENCE_PREFIX } from "@/ui/centre/entry-editor/article-editor";
import { test as baseTest } from "@tests/unit/ui/fixtures";

const test = baseTest;

const mocks = vi.hoisted(() => {
    interface MockRichTextArgs<M> {
        id: string;
        extensions?: {
            placeholder?: string;
            mention?: {
                prefix: string;
                querier: (query: string) => Promise<M[]>;
            };
        };
    }

    class MockRichTextEditorService<M> {
        id: string;
        changed = false;
        args: MockRichTextArgs<M>;
        onChange = new MultiEventProducer<void, unknown>();
        onSelectMention = new MultiEventProducer<{ data?: M }, unknown>();
        load = vi.fn();
        cleanUp = vi.fn();

        constructor(args: MockRichTextArgs<M>) {
            this.id = args.id;
            this.args = args;
            instances.push(this as MockRichTextEditorService<unknown>);
        }
    }

    const instances: MockRichTextEditorService<unknown>[] = [];

    return {
        MockRichTextEditorService,
        instances,
    };
});

vi.mock("@/lib/components/rich-text-editor", () => ({
    RichTextEditorService: mocks.MockRichTextEditorService,
}));

import { ArticleEditorService } from "@/ui/centre/entry-editor/article-editor/article-editor-service.svelte";

describe("ArticleEditorService", () => {
    beforeEach(() => {
        mocks.instances.length = 0;
        vi.clearAllMocks();
    });

    test("initializes rich-text editor config and exposes expected identity", ({
        domainManager,
        clientData,
    }) => {
        const info = new EntryInfoService("entry7");

        const service = new ArticleEditorService(
            domainManager,
            clientData,
            info,
        );
        const richText = mocks.instances[0];

        expect(service.id).toBe("article-editor-entry7");
        expect(service.loaded).toBe(false);
        expect(richText.id).toBe("article-rich-text-editor-entry7");
        expect(richText.args.extensions?.placeholder).toBe(
            "Enter a description ...",
        );
        expect(richText.args.extensions?.mention?.prefix).toBe(
            ARTICLE_REFERENCE_PREFIX,
        );
        expect(typeof richText.args.extensions?.mention?.querier).toBe(
            "function",
        );
    });

    test("proxies changed state to the rich-text service", ({
        domainManager,
        clientData,
    }) => {
        const info = new EntryInfoService("entry11");

        const service = new ArticleEditorService(
            domainManager,
            clientData,
            info,
        );
        const richText = mocks.instances[0];

        expect(service.changed).toBe(false);

        service.changed = true;

        expect(richText.changed).toBe(true);
        expect(service.changed).toBe(true);
    });

    test("loads article content and marks the service as loaded", ({
        domainManager,
        clientData,
    }) => {
        const info = new EntryInfoService("entry9");
        const payload: JSONContent = {
            type: "doc",
            content: [
                { type: "paragraph", content: [{ type: "text", text: "a" }] },
            ],
        };

        const service = new ArticleEditorService(
            domainManager,
            clientData,
            info,
        );
        const richText = mocks.instances[0];

        service.load(payload);

        expect(richText.load).toHaveBeenCalledOnce();
        expect(richText.load).toHaveBeenCalledWith(payload);
        expect(service.loaded).toBe(true);
    });

    test("forwards rich-text change notifications as entry change events", ({
        domainManager,
        clientData,
    }) => {
        const info = new EntryInfoService("entry13");
        const onChange = vi.fn();

        const service = new ArticleEditorService(
            domainManager,
            clientData,
            info,
        );
        const richText = mocks.instances[0];
        service.onChange.subscribe(onChange);

        richText.onChange.produce();

        expect(onChange).toHaveBeenCalledOnce();
        expect(onChange).toHaveBeenCalledWith({
            id: "entry13",
            textChanged: true,
        });
    });

    test("forwards mention selection only when reference id is present", ({
        domainManager,
        clientData,
    }) => {
        const info = new EntryInfoService("entry13");
        const onSelectEntryReference = vi.fn();

        const service = new ArticleEditorService(
            domainManager,
            clientData,
            info,
        );
        const richText = mocks.instances[0];
        service.onSelectEntryReference.subscribe(onSelectEntryReference);

        richText.onSelectMention.produce({ data: { id: "entry88" } });
        richText.onSelectMention.produce({ data: {} });
        richText.onSelectMention.produce({});

        expect(onSelectEntryReference).toHaveBeenCalledOnce();
        expect(onSelectEntryReference).toHaveBeenCalledWith({ id: "entry88" });
    });

    test("queries references by title and serializes domain results for mention items", async ({
        domainManager,
        clientData,
    }) => {
        const search = vi
            .spyOn(domainManager.entries, "search")
            .mockResolvedValue([
                {
                    id: "entry10",
                    folderId: "folder1",
                    entityType: EntryType.Person,
                    title: "Self",
                },
                {
                    id: "entry20",
                    folderId: "folder1",
                    entityType: EntryType.Person,
                    title: "Alpha",
                },
                {
                    id: "entry30",
                    folderId: "folder1",
                    entityType: EntryType.Person,
                    title: "Beta",
                },
            ]);
        const info = new EntryInfoService("entry10");

        new ArticleEditorService(domainManager, clientData, info);
        const richText = mocks.instances[0];
        const querier = richText.args.extensions?.mention?.querier;

        expect(querier).toBeDefined();

        const response = await querier!("a");

        expect(search).toHaveBeenCalledOnce();
        expect(search).toHaveBeenCalledWith({
            projectId: clientData.projectId,
            keyword: "a",
            limit: 5,
        });
        expect(response).toStrictEqual([
            { id: "entry20", label: "Alpha" },
            { id: "entry30", label: "Beta" },
        ]);
    });

    test("returns an empty list when reference query has no backend results", async ({
        domainManager,
        clientData,
    }) => {
        const search = vi
            .spyOn(domainManager.entries, "search")
            .mockResolvedValue(null);
        const info = new EntryInfoService("entry2");

        new ArticleEditorService(domainManager, clientData, info);
        const richText = mocks.instances[0];
        const querier = richText.args.extensions?.mention?.querier;

        const response = await querier!("none");

        expect(search).toHaveBeenCalledWith({
            projectId: clientData.projectId,
            keyword: "none",
            limit: 5,
        });
        expect(response).toStrictEqual([]);
    });

    test("cleans up by delegating to the rich-text service", ({
        domainManager,
        clientData,
    }) => {
        const info = new EntryInfoService("entry15");

        const service = new ArticleEditorService(
            domainManager,
            clientData,
            info,
        );
        const richText = mocks.instances[0];

        service.cleanUp();

        expect(richText.cleanUp).toHaveBeenCalledOnce();
    });
});
