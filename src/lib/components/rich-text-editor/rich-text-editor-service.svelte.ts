import { Node as PMNode } from "prosemirror-model";

import { Editor, type Extensions, type JSONContent } from "@tiptap/core";

import { Placeholder } from "@tiptap/extension-placeholder";
import type { EditorProps } from "@tiptap/pm/view";

import { StarterKit } from "@tiptap/starter-kit";

import type { IComponentService } from "@/interface";
import { MultiEventProducer } from "@/utils/event-producer";

import {
    Mention,
    type MentionExtensionArgs,
    type MentionItemData,
} from "./mention";

interface ExtensionArgs<M extends MentionItemData> {
    placeholder?: string;
    mention?: MentionExtensionArgs<M>;
}

interface RichTextEditorServiceArgs<M extends MentionItemData> {
    id: string;
    extensions?: ExtensionArgs<M>;
}

export class RichTextEditorService<
    M extends MentionItemData = MentionItemData,
> implements IComponentService {
    // STATE
    id: string;
    editor: Editor;
    private _mounted = $state(false);
    private _changed = false;

    // EVENTS
    onChange: MultiEventProducer<void, unknown>;
    onSelectMention: MultiEventProducer<M, unknown>;

    constructor({ id, extensions }: RichTextEditorServiceArgs<M>) {
        this.id = id;

        const _extensions = this._buildExtensions(extensions ?? {});
        this.editor = $state(this._buildEditor(_extensions));

        this.onChange = new MultiEventProducer();
        this.onSelectMention = new MultiEventProducer();
    }

    get mounted() {
        return this._mounted;
    }

    get changed() {
        return this._changed;
    }

    set changed(changed: boolean) {
        this._changed = changed;
    }

    get content(): JSONContent {
        return this.editor.getJSON() ?? {};
    }

    set content(content: JSONContent) {
        this.editor.commands.setContent(content);
    }

    get serialized(): string {
        return JSON.stringify(this.content);
    }

    // INITIALIZATION

    private _buildExtensions({ placeholder, mention }: ExtensionArgs<M>) {
        const extensions: Extensions = [StarterKit];

        if (placeholder)
            extensions.push(Placeholder.configure({ placeholder }));

        if (mention) extensions.push(Mention({ querier: mention.querier }));

        return extensions;
    }

    private _buildEditor(extensions: Extensions) {
        return new Editor({
            element: null,
            extensions,
            onTransaction: ({ editor }) => {
                this.update(editor);
            },
            editorProps: this._buildDefaultEditorProps(),
        });
    }

    private _buildDefaultEditorProps(): EditorProps {
        return {
            handleClickOn: (_, __, node) => this._onClickEditor(node),
        };
    }

    // LOADING

    load(text: JSONContent) {
        this.content = text ?? "";
    }

    mount(element: HTMLDivElement, props?: EditorProps) {
        this.editor?.mount(element as HTMLDivElement);
        this.editor?.setOptions({
            editorProps: {
                ...this._buildDefaultEditorProps(),
                ...props,
            },
        });
        this._mounted = true;
    }

    // UPDATING

    update(editor: Editor) {
        this.editor = editor;
        this._changed = true;
        this.onChange.produce();
    }

    clear() {
        this.editor.commands.clearContent();
    }

    // CLEAN UP

    cleanUp() {
        this.editor.unmount();
        this._mounted = false;
    }

    // EVENT HANDLING

    private _onClickEditor(node: PMNode) {
        if (node.type.name == "mention" && node.attrs["id"] !== null)
            this.onSelectMention.produce(node.attrs as M);
    }
}
