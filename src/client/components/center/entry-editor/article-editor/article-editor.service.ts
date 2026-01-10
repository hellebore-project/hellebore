import { Node as PMNode } from "prosemirror-model";
import { Editor, JSONContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { makeAutoObservable } from "mobx";

import { ARTICLE_REFERENCE_PREFIX } from "@/constants";
import { DomainManager } from "@/services";
import {
    SuggestionData,
    useReferenceExtension,
} from "@/components/rich-text-editor";
import {
    ChangeEntryEvent,
    IComponentService,
    OpenEntryEditorEvent,
} from "@/interface";
import { MultiEventProducer } from "@/model";

import { EntryInfoService } from "../entry-info.service";

type PrivateKeys = "_changed" | "_domain";

interface ArticleEditorServiceArgs {
    domain: DomainManager;
    info: EntryInfoService;
}

export class ArticleEditorService implements IComponentService {
    editor: Editor;
    private _changed = false;
    private _selectedRefIndex: number | null = null;

    private _domain: DomainManager;
    info: EntryInfoService;

    onChange: MultiEventProducer<ChangeEntryEvent, unknown>;
    onSelectReference: MultiEventProducer<OpenEntryEditorEvent, unknown>;

    constructor({ domain, info }: ArticleEditorServiceArgs) {
        this._domain = domain;
        this.info = info;

        this.onChange = new MultiEventProducer();
        this.onSelectReference = new MultiEventProducer();

        this.editor = this._buildEditor();

        makeAutoObservable<ArticleEditorService, PrivateKeys>(this, {
            _changed: false,
            _domain: false,
            info: false,
            onChange: false,
            onSelectReference: false,
        });
    }

    get key() {
        return `ARTICLE_EDITOR_${this.info.id}`;
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

    initialize(text: JSONContent) {
        this.content = text ?? "";
    }

    reset() {
        this.editor.commands.clearContent();
        this._changed = false;
    }

    _buildEditor() {
        const Reference = useReferenceExtension({
            // TODO: need to decide what character to use;
            // currently the default is '@', but '[[' might also work
            prefix: ARTICLE_REFERENCE_PREFIX,
            queryItems: async ({ query }) => this._queryByTitle(query),
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
        this.onChange.produce({ id: this.info.id });
    }

    async _queryByTitle(titleFragment: string): Promise<SuggestionData[]> {
        this.selectedRefIndex = 0;

        const results = await this._domain.entries.search({
            keyword: titleFragment,
            limit: 5,
        });
        if (!results) return [];

        return results
            .filter((info) => info.id != this.info.id)
            .map((info) => ({ label: info.title, value: info.id }));
    }

    _onClickEditor(node: PMNode) {
        if (node.type.name == "mention") {
            const id: number | null = node.attrs["id"] ?? null;
            if (id !== null) this.onSelectReference.produce({ id });
        }
    }
}
