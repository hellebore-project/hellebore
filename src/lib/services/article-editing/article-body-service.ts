import { Node as PMNode } from "prosemirror-model";
import { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { makeAutoObservable } from "mobx";

import { Suggestion } from "../../interface";
import DataService from "../data";
import { useReferenceExtension } from "../../shared/rich-text-editor";

type IDAccessor = () => number;
type ChangeHandler = () => void;
export type OpenArticleHandler = (id: number) => void;

interface ArticleBodyServiceSettings {
    dataService: DataService;
    getID: IDAccessor;
    onChange: ChangeHandler;
    onOpenAnotherArticle: OpenArticleHandler;
}

export class ArticleBodyService {
    editor: Editor;
    changed: boolean = false;
    selectedRefIndex: number | null = null;

    data: DataService;

    getID: IDAccessor;
    onChange: ChangeHandler;
    onOpenAnotherArticle: OpenArticleHandler;

    constructor({
        dataService,
        getID,
        onChange,
        onOpenAnotherArticle,
    }: ArticleBodyServiceSettings) {
        makeAutoObservable(this, {
            data: false,
            getID: false,
            onChange: false,
            onOpenAnotherArticle: false,
        });

        this.data = dataService;
        this.getID = getID;
        this.onChange = onChange;
        this.onOpenAnotherArticle = onOpenAnotherArticle;

        this.editor = this._buildEditor();
    }

    get content(): any {
        return this.editor.getJSON();
    }

    set content(content: any) {
        this.editor.commands.setContent(content);
    }

    get text(): string {
        return JSON.stringify(this.content);
    }

    setSelectedRefIndex(index: number | null) {
        this.selectedRefIndex = index;
    }

    reset() {
        this.editor.commands.clearContent();
    }

    _buildEditor() {
        const Reference = useReferenceExtension({
            queryItems: ({ query }) => this._queryByTitle(query),
            getSelectedIndex: () => this.selectedRefIndex,
            setSelectedIndex: (index) => this.setSelectedRefIndex(index),
        });

        return new Editor({
            extensions: [StarterKit, Reference],
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

    _queryByTitle(titleFragment: string): Suggestion[] {
        return this.data.articles
            .queryByTitle(titleFragment)
            .filter((info) => info.id != this.getID())
            .map((info) => ({ label: info.title, value: info.id }));
    }

    _onClickEditor(node: PMNode) {
        if (node.type.name == "mention") {
            const articleID: number | null = node.attrs["id"] ?? null;
            if (articleID != null) this.onOpenAnotherArticle?.(articleID);
        }
    }
}
