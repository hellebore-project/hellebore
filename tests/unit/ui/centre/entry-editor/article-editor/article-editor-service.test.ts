import type { JSONContent } from "@tiptap/core";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { ARTICLE_REFERENCE_PREFIX } from "@/constants";
import { MultiEventProducer } from "@/utils/event-producer";
import { EntryInfoService } from "@/ui/centre/entry-editor/entry-info-service.svelte";

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

    it("initializes rich-text editor config and exposes expected identity", () => {
        const search = vi.fn();
        const domain = { entries: { search } };
        const info = new EntryInfoService(7);

        const service = new ArticleEditorService(domain as never, info);
        const richText = mocks.instances[0];

        expect(service.id).toBe("article-editor-7");
        expect(service.loaded).toBe(false);
        expect(richText.id).toBe("article-rich-text-editor-7");
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

    it("proxies changed state to the rich-text service", () => {
        const domain = { entries: { search: vi.fn() } };
        const info = new EntryInfoService(11);

        const service = new ArticleEditorService(domain as never, info);
        const richText = mocks.instances[0];

        expect(service.changed).toBe(false);

        service.changed = true;

        expect(richText.changed).toBe(true);
        expect(service.changed).toBe(true);
    });

    it("loads article content and marks the service as loaded", () => {
        const domain = { entries: { search: vi.fn() } };
        const info = new EntryInfoService(9);
        const payload: JSONContent = {
            type: "doc",
            content: [
                { type: "paragraph", content: [{ type: "text", text: "a" }] },
            ],
        };

        const service = new ArticleEditorService(domain as never, info);
        const richText = mocks.instances[0];

        service.load(payload);

        expect(richText.load).toHaveBeenCalledOnce();
        expect(richText.load).toHaveBeenCalledWith(payload);
        expect(service.loaded).toBe(true);
    });

    it("forwards rich-text change notifications as entry change events", () => {
        const domain = { entries: { search: vi.fn() } };
        const info = new EntryInfoService(13);
        const onChange = vi.fn();

        const service = new ArticleEditorService(domain as never, info);
        const richText = mocks.instances[0];
        service.onChange.subscribe(onChange);

        richText.onChange.produce();

        expect(onChange).toHaveBeenCalledOnce();
        expect(onChange).toHaveBeenCalledWith({
            id: 13,
            textChanged: true,
        });
    });

    it("forwards mention selection only when reference id is present", () => {
        const domain = { entries: { search: vi.fn() } };
        const info = new EntryInfoService(13);
        const onSelectEntryReference = vi.fn();

        const service = new ArticleEditorService(domain as never, info);
        const richText = mocks.instances[0];
        service.onSelectEntryReference.subscribe(onSelectEntryReference);

        richText.onSelectMention.produce({ data: { id: 88 } });
        richText.onSelectMention.produce({ data: {} });
        richText.onSelectMention.produce({});

        expect(onSelectEntryReference).toHaveBeenCalledOnce();
        expect(onSelectEntryReference).toHaveBeenCalledWith({ id: 88 });
    });

    it("queries references by title and serializes domain results for mention items", async () => {
        const search = vi.fn().mockResolvedValue([
            { id: 10, title: "Self" },
            { id: 20, title: "Alpha" },
            { id: 30, title: "Beta" },
        ]);
        const domain = { entries: { search } };
        const info = new EntryInfoService(10);

        new ArticleEditorService(domain as never, info);
        const richText = mocks.instances[0];
        const querier = richText.args.extensions?.mention?.querier;

        expect(querier).toBeDefined();

        const response = await querier!("a");

        expect(search).toHaveBeenCalledOnce();
        expect(search).toHaveBeenCalledWith({ keyword: "a", limit: 5 });
        expect(response).toStrictEqual([
            { id: 20, label: "Alpha" },
            { id: 30, label: "Beta" },
        ]);
    });

    it("returns an empty list when reference query has no backend results", async () => {
        const search = vi.fn().mockResolvedValue(null);
        const domain = { entries: { search } };
        const info = new EntryInfoService(2);

        new ArticleEditorService(domain as never, info);
        const richText = mocks.instances[0];
        const querier = richText.args.extensions?.mention?.querier;

        const response = await querier!("none");

        expect(search).toHaveBeenCalledWith({ keyword: "none", limit: 5 });
        expect(response).toStrictEqual([]);
    });

    it("cleans up by delegating to the rich-text service", () => {
        const domain = { entries: { search: vi.fn() } };
        const info = new EntryInfoService(15);

        const service = new ArticleEditorService(domain as never, info);
        const richText = mocks.instances[0];

        service.cleanUp();

        expect(richText.cleanUp).toHaveBeenCalledOnce();
    });
});
