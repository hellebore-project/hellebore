import { Node as PMNode } from "prosemirror-model";
import { Editor, JSONContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { makeAutoObservable } from "mobx";

import { IClientManager } from "@/client/interface";
import {
    SuggestionData,
    useReferenceExtension,
} from "@/shared/rich-text-editor";
import { EventProducer } from "@/utils/event";

import { EntityInfoEditor } from "./info-editor";

type PrivateKeys = "_client" | "_info";

interface ArticleEditorSettings {
    client: IClientManager;
    info: EntityInfoEditor;
}

export class ArticleEditor {
    editor: Editor;
    changed = false;
    private _selectedRefIndex: number | null = null;

    private _client: IClientManager;
    private _info: EntityInfoEditor;

    onChange: EventProducer<void, void>;

    constructor({ client, info }: ArticleEditorSettings) {
        this._client = client;
        this._info = info;
        this.onChange = new EventProducer();

        this.editor = this._buildEditor();

        makeAutoObservable<ArticleEditor, PrivateKeys>(this, {
            _client: false,
            _info: false,
            onChange: false,
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

    get selectedRefIndex() {
        return this._selectedRefIndex;
    }

    set selectedRefIndex(index: number | null) {
        this._selectedRefIndex = index;
    }

    initialize(text: string) {
        this.content = text ? JSON.parse(text) : "";
    }

    afterSync() {
        this.changed = false;
    }

    reset() {
        this.editor.commands.clearContent();
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
        this.changed = true;
        this.onChange.produce();
    }

    _queryByTitle(titleFragment: string): SuggestionData[] {
        this.selectedRefIndex = 0;
        return this._client.domain.entries
            .queryByTitle(titleFragment)
            .filter((info) => info.id != this._info.id)
            .map((info) => ({ label: info.title, value: info.id }));
    }

    _onClickEditor(node: PMNode) {
        if (node.type.name == "mention") {
            const id: number | null = node.attrs["id"] ?? null;
            if (id !== null) this._client.openArticleEditor?.(id);
        }
    }
}
