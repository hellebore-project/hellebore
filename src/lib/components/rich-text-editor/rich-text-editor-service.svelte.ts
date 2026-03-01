// import { Node as PMNode } from "prosemirror-model";
// eslint-disable-next-line
import { Editor, type JSONContent } from "@tiptap/core";
// eslint-disable-next-line
import { Placeholder } from "@tiptap/extension-placeholder";
// eslint-disable-next-line
import { StarterKit } from "@tiptap/starter-kit";

// import { ARTICLE_REFERENCE_PREFIX } from "@/constants";
import type { IComponentService, OpenEntryEditorEvent } from "@/interface";
import { MultiEventProducer } from "@/utils/event-producer";

// import { useReferenceExtension, type SuggestionData } from "./mention-service";

interface RichTextEditorServiceArgs {
    placeholder: string;
}
export class RichTextEditorService implements IComponentService {
    readonly key = "rich-text-editor";

    editor: Editor;
    private _changed = false;

    onChange: MultiEventProducer<void, unknown>;
    onSelectReference: MultiEventProducer<OpenEntryEditorEvent, unknown>;

    constructor({ placeholder }: RichTextEditorServiceArgs) {
        this.editor = $state(this._buildEditor(placeholder));

        this.onChange = new MultiEventProducer();
        this.onSelectReference = new MultiEventProducer();
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

    get changed() {
        return this._changed;
    }

    set changed(changed: boolean) {
        this._changed = changed;
    }

    initialize(text: JSONContent) {
        this.content = text ?? "";
    }

    reset() {
        this.editor.commands.clearContent();
        this._changed = false;
    }

    _buildEditor(placeholder: string) {
        // const Reference = useReferenceExtension({
        //     // TODO: need to decide what character to use;
        //     // currently the default is '@', but '[[' might also work
        //     prefix: ARTICLE_REFERENCE_PREFIX,
        //     queryItems: async ({ query }) => this._queryByTitle(query),
        //     getSelectedIndex: () => this.selectedRefIndex,
        //     setSelectedIndex: (index) =>
        //         (this.selectedRefIndex = index as number),
        // });

        return new Editor({
            element: null,
            extensions: [
                StarterKit,
                Placeholder.configure({ placeholder }),
                // Reference,
            ],
            onTransaction: ({ editor }) => {
                this._updateEditor(editor);
            },
            editorProps: {},
            // editorProps: {
            //     handleClickOn: (_, __, node) => this._onClickEditor(node),
            // },
        });
    }

    _updateEditor(editor: Editor) {
        this.editor = editor;
        this._changed = true;
        this.onChange.produce();
    }

    // async _queryByTitle(titleFragment: string): Promise<SuggestionData[]> {
    //     this.selectedRefIndex = 0;

    //     const results = await this._domain.entries.search({
    //         keyword: titleFragment,
    //         limit: 5,
    //     });
    //     if (!results) return [];

    //     return results
    //         .filter((info) => info.id != this.info.id)
    //         .map((info) => ({ label: info.title, value: info.id }));
    // }

    // _onClickEditor(node: PMNode) {
    //     if (node.type.name == "mention") {
    //         const id: number | null = node.attrs["id"] ?? null;
    //         if (id !== null) this.onSelectReference.produce({ id });
    //     }
    // }
}
