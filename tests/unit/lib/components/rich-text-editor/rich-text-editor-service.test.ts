import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
    const createdEditors: MockEditor[] = [];

    const setContent = vi.fn();
    const clearContent = vi.fn();
    const mount = vi.fn();
    const unmount = vi.fn();
    const setOptions = vi.fn();
    const getJSON = vi.fn(() => ({ type: "doc", content: [] }));

    const placeholderConfigure = vi.fn((args: { placeholder: string }) => ({
        name: "placeholder",
        ...args,
    }));

    class MockEditor {
        options: {
            extensions: unknown[];
            editorProps: { handleClickOn: (...args: unknown[]) => unknown };
            onTransaction: (args: { editor: MockEditor }) => void;
        };

        commands = {
            setContent,
            clearContent,
        };

        constructor(options: MockEditor["options"]) {
            this.options = options;
            createdEditors.push(this);
        }

        getJSON() {
            return getJSON();
        }

        mount(element: HTMLDivElement) {
            mount(element);
        }

        unmount() {
            unmount();
        }

        setOptions(options: unknown) {
            setOptions(options);
        }
    }

    return {
        MockEditor,
        createdEditors,
        setContent,
        clearContent,
        mount,
        unmount,
        setOptions,
        getJSON,
        placeholderConfigure,
    };
});

vi.mock("@tiptap/core", () => ({
    Editor: mocks.MockEditor,
    mergeAttributes: vi.fn(),
}));

vi.mock("@tiptap/starter-kit", () => ({
    StarterKit: { name: "starter-kit" },
}));

vi.mock("@tiptap/extension-placeholder", () => ({
    Placeholder: {
        configure: mocks.placeholderConfigure,
    },
}));

import { RichTextEditorService } from "@/lib/components/rich-text-editor/rich-text-editor-service.svelte";

describe("RichTextEditorService", () => {
    beforeEach(() => {
        mocks.createdEditors.length = 0;
        vi.clearAllMocks();
    });

    it("initializes with default state and starter extensions", () => {
        const service = new RichTextEditorService<{ id: string }>({
            id: "rte-1",
        });

        expect(service.id).toBe("rte-1");
        expect(service.mounted).toBe(false);
        expect(service.changed).toBe(false);
        expect(mocks.createdEditors).toHaveLength(1);

        const editor = mocks.createdEditors[0];
        expect(editor.options.extensions).toEqual([{ name: "starter-kit" }]);

        expect(service.content).toEqual({ type: "doc", content: [] });
        expect(service.serialized).toBe(
            JSON.stringify({ type: "doc", content: [] }),
        );
    });

    it("adds the placeholder extension when provided", () => {
        new RichTextEditorService<{ id: string }>({
            id: "rte-2",
            extensions: {
                placeholder: "Type here",
            },
        });

        expect(mocks.placeholderConfigure).toHaveBeenCalledWith({
            placeholder: "Type here",
        });

        const editor = mocks.createdEditors[0];
        expect(editor.options.extensions).toEqual([
            { name: "starter-kit" },
            { name: "placeholder", placeholder: "Type here" },
        ]);
    });

    it("updates change state and emits onChange", () => {
        const service = new RichTextEditorService<{ id: string }>({
            id: "rte-3",
        });

        const listener = vi.fn();
        service.onChange.subscribe(listener);

        const nextEditor = mocks.createdEditors[0];
        service.update(nextEditor as never);

        expect(service.changed).toBe(true);
        expect(listener).toHaveBeenCalledTimes(1);
        expect(service.editor).toBe(nextEditor);
    });

    it("loads content, clears content, and supports null fallback in load", () => {
        const service = new RichTextEditorService<{ id: string }>({
            id: "rte-5",
        });

        const payload = { type: "doc", content: [{ type: "paragraph" }] };

        service.load(payload);
        expect(mocks.setContent).toHaveBeenCalledWith(payload);

        service.load(null as never);
        expect(mocks.setContent).toHaveBeenLastCalledWith("");

        service.clear();
        expect(mocks.clearContent).toHaveBeenCalledTimes(1);
    });

    it("emits selected mention data when mention node is clicked", () => {
        const service = new RichTextEditorService<{ id: string }>({
            id: "rte-6",
        });

        const listener = vi.fn();
        service.onSelectMention.subscribe(listener);

        const editor = mocks.createdEditors[0];
        const handleClickOn = editor.options.editorProps.handleClickOn;

        handleClickOn(null, null, {
            type: { name: "mention" },
            attrs: { label: "Alice", personId: "person-1" },
        });

        expect(listener).toHaveBeenCalledWith({
            label: "Alice",
            data: { personId: "person-1" },
        });

        listener.mockClear();

        handleClickOn(null, null, {
            type: { name: "paragraph" },
            attrs: {},
        });

        expect(listener).not.toHaveBeenCalled();
    });
});
