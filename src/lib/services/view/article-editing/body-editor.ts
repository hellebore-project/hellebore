import { Node as PMNode } from "prosemirror-model";
import { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { makeAutoObservable } from "mobx";

import { Suggestion } from "@/interface";
import { DomainService } from "@/services/domain";
import { useReferenceExtension } from "@/shared/rich-text-editor";
import { ArticleInfoService } from "./info-editor";

type ChangeHandler = () => void;
export type OpenArticleHandler = (id: number) => void;

interface ArticleBodyServiceSettings {
    domain: DomainService;
    info: ArticleInfoService;
    onChange: ChangeHandler;
    openArticle: OpenArticleHandler;
}

export class ArticleBodyService {
    editor: Editor;
    changed: boolean = false;
    _selectedRefIndex: number | null = null;

    domain: DomainService;
    info: ArticleInfoService;

    onChange: ChangeHandler;
    openArticle: OpenArticleHandler;

    constructor({
        domain,
        info,
        onChange,
        openArticle,
    }: ArticleBodyServiceSettings) {
        makeAutoObservable(this, {
            domain: false,
            info: false,
            onChange: false,
            openArticle: false,
        });

        this.domain = domain;
        this.info = info;
        this.onChange = onChange;
        this.openArticle = openArticle;

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

    _queryByTitle(titleFragment: string): Suggestion[] {
        this.selectedRefIndex = 0;
        return this.domain.articles
            .queryByTitle(titleFragment)
            .filter((info) => info.id != this.info.id)
            .map((info) => ({ label: info.title, value: info.id }));
    }

    _onClickEditor(node: PMNode) {
        if (node.type.name == "mention") {
            const articleID: number | null = node.attrs["id"] ?? null;
            if (articleID != null) this.openArticle?.(articleID);
        }
    }
}
