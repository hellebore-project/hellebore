import { Node as PMNode } from "prosemirror-model";
import { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { makeAutoObservable } from "mobx";

import { EntityChangeHandler, SuggestionData } from "@/interface";
import { useReferenceExtension } from "@/shared/rich-text-editor";
import { ViewManagerInterface } from "../interface";
import { EntityInfoEditor } from "./info-editor";

interface ArticleTextEditorSettings {
    view: ViewManagerInterface;
    info: EntityInfoEditor;
    onChange: EntityChangeHandler;
}

export class ArticleTextEditor {
    editor: Editor;
    changed: boolean = false;
    private _selectedRefIndex: number | null = null;

    view: ViewManagerInterface;
    info: EntityInfoEditor;

    onChange: EntityChangeHandler;

    constructor({ view, info, onChange }: ArticleTextEditorSettings) {
        makeAutoObservable(this, {
            view: false,
            info: false,
            onChange: false,
        });

        this.view = view;
        this.info = info;
        this.onChange = onChange;

        this.editor = this._buildEditor();
    }

    get content(): any {
        return this.editor.getJSON();
    }

    set content(content: any) {
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

    initialize(body: string) {
        this.content = body ? JSON.parse(body) : "";
    }

    sync() {
        this.changed = false;
    }

    reset() {
        this.editor.commands.clearContent();
    }

    _buildEditor() {
        const Reference = useReferenceExtension({
            queryItems: ({ query }) => this._queryByTitle(query),
            getSelectedIndex: () => this.selectedRefIndex,
            setSelectedIndex: (index) => (this.selectedRefIndex = index),
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
        this.onChange();
    }

    _queryByTitle(titleFragment: string): SuggestionData[] {
        this.selectedRefIndex = 0;
        return this.view.domain.articles
            .queryByTitle(titleFragment)
            .filter((info) => info.id != this.info.id)
            .map((info) => ({ label: info.title, value: info.id }));
    }

    _onClickEditor(node: PMNode) {
        if (node.type.name == "mention") {
            const articleID: number | null = node.attrs["id"] ?? null;
            if (articleID != null) this.view.openArticleEditor?.(articleID);
        }
    }
}
