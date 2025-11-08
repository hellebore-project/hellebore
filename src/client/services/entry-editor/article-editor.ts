import { Node as PMNode } from "prosemirror-model";
import { Editor, JSONContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { makeAutoObservable } from "mobx";

import { DomainManager } from "@/domain";
import { Id } from "@/interface";
import {
    SuggestionData,
    useReferenceExtension,
} from "@/shared/rich-text-editor";
import { EventProducer } from "@/utils/event";

import { EntryInfoEditor } from "./info-editor";

type PrivateKeys = "_changed" | "_domain" | "_info";

interface ArticleEditorSettings {
    domain: DomainManager;
    info: EntryInfoEditor;
}

export class ArticleEditor {
    editor: Editor;
    private _changed = false;
    private _selectedRefIndex: number | null = null;

    private _domain: DomainManager;
    private _info: EntryInfoEditor;

    onChange: EventProducer<Id, void>;
    onSelectReference: EventProducer<Id, void>;

    constructor({ domain, info }: ArticleEditorSettings) {
        this._domain = domain;
        this._info = info;

        this.onChange = new EventProducer();
        this.onSelectReference = new EventProducer();

        this.editor = this._buildEditor();

        makeAutoObservable<ArticleEditor, PrivateKeys>(this, {
            _changed: false,
            _domain: false,
            _info: false,
            onChange: false,
            onSelectReference: false,
        });
    }

    get content(): JSONContent {
        return this.editor.getJSON();
    }

    set content(content: JSONContent) {
        this.editor.commands.setContent(content);
    }

    get serialized(): string {
        return JSON.stringify(this.content);
    }

    get changed() {
        return this._changed;
    }

    set changed(changed: boolean) {
        this._changed = changed;
    }

    get selectedRefIndex() {
        return this._selectedRefIndex;
    }

    set selectedRefIndex(index: number | null) {
        this._selectedRefIndex = index;
    }

    initialize(text: string) {
        this.content = text ? JSON.parse(text) : "";
    }

    reset() {
        this.editor.commands.clearContent();
        this._changed = false;
    }

    _buildEditor() {
        const Reference = useReferenceExtension({
            queryItems: ({ query }) => this._queryByTitle(query),
            getSelectedIndex: () => this.selectedRefIndex,
            setSelectedIndex: (index) =>
                (this.selectedRefIndex = index as number),
        });

        return new Editor({
            extensions: [
                StarterKit,
                Placeholder.configure({ placeholder: "Article Body" }),
                Reference,
            ],
            onUpdate: ({ editor }) => {
                this._updateEditor(editor as Editor);
            },
            editorProps: {
                handleClickOn: (_, __, node) => this._onClickEditor(node),
            },
        });
    }

    _updateEditor(editor: Editor) {
        this.editor = editor;
        this._changed = true;
        this.onChange.produce(this._info.id);
    }

    _queryByTitle(titleFragment: string): SuggestionData[] {
        this.selectedRefIndex = 0;
        return this._domain.entries
            .queryByTitle(titleFragment)
            .filter((info) => info.id != this._info.id)
            .map((info) => ({ label: info.title, value: info.id }));
    }

    _onClickEditor(node: PMNode) {
        if (node.type.name == "mention") {
            const id: number | null = node.attrs["id"] ?? null;
            if (id !== null) this.onSelectReference.produce(id);
        }
    }
}
