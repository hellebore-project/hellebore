import Mention, { MentionOptions } from "@tiptap/extension-mention";
import { mergeAttributes, ReactRenderer } from "@tiptap/react";
import {
    SuggestionKeyDownProps,
    SuggestionOptions,
    SuggestionProps,
} from "@tiptap/suggestion";
import tippy from "tippy.js";

import { Suggestion } from "@/interface";
import {
    VerticalMenu,
    VerticalMenuItemData,
    VerticalMenuSettings,
} from "../vertical-menu";

type QueryResult = string;
type DOMRectAccessor = () => DOMRect;

export interface QuerySettings {
    query: string;
}

export interface ReferenceExtensionSettings {
    queryItems: (settings: QuerySettings) => any[];
    getSelectedIndex: () => number | null;
    setSelectedIndex: (value: any) => void;
}

class ReferenceSuggestionRenderer {
    _component: ReactRenderer<
        typeof VerticalMenu,
        VerticalMenuSettings
    > | null = null;
    _popup: any[];
    _data: any[];
    _confirm: ((item: any) => void) | null = null;

    getSelectedIndex: () => number | null;
    setSelectedIndex: (value: any) => void;

    constructor(
        getSelectedIndex: () => number | null,
        setSelectedIndex: (value: any) => void,
    ) {
        this._popup = [];
        this._data = [];
        this.getSelectedIndex = getSelectedIndex;
        this.setSelectedIndex = setSelectedIndex;
    }

    get component(): ReactRenderer<typeof VerticalMenu, VerticalMenuSettings> {
        return this._component as ReactRenderer<
            typeof VerticalMenu,
            VerticalMenuSettings
        >;
    }

    set component(
        component: ReactRenderer<typeof VerticalMenu, VerticalMenuSettings>,
    ) {
        this._component = component;
    }

    get selectedIndex() {
        return this.getSelectedIndex() ?? 0;
    }

    onStart(props: SuggestionProps) {
        this._data = this.convertQueryResult(props.items);
        this._confirm = props.command;

        const dropdownSettings: VerticalMenuSettings = {
            data: this._data,
            getSelectedIndex: this.getSelectedIndex,
            onConfirm: (_, item) => this.onConfirm(item),
            placeholder: "No results",
            withBorder: true,
            radius: 0,
            item: {
                onMouseOver: (e) =>
                    this.setSelectedIndex(
                        Number(e.currentTarget.getAttribute("data-index")),
                    ),
            },
        };

        this.component = new ReactRenderer<
            typeof VerticalMenu,
            VerticalMenuSettings
        >(VerticalMenu, {
            props: dropdownSettings,
            editor: props.editor,
        });

        if (!props.clientRect) return;

        this._popup = tippy("body", {
            getReferenceClientRect: props.clientRect as DOMRectAccessor,
            appendTo: () => document.body,
            content: this.component.element,
            showOnCreate: true,
            interactive: true,
            trigger: "manual",
            placement: "bottom-start",
        });
    }

    onUpdate(props: SuggestionProps) {
        this._data = this.convertQueryResult(props.items);
        this._confirm = props.command;
        this.component.updateProps({ data: this._data });
        if (!props.clientRect) return;
        this._popup[0].setProps({
            getReferenceClientRect: props.clientRect,
        });
    }

    async onConfirm(item: VerticalMenuItemData) {
        if (item) this._confirm?.({ id: item.value, label: item.label });
    }

    onKeyDown(props: SuggestionKeyDownProps) {
        if (props.event.key === "Escape") {
            this._popup[0].hide();
            return true;
        }

        const event = props.event;
        if (event.key === "ArrowUp") {
            this.setSelectedIndex(
                (this.selectedIndex + this._data.length - 1) %
                    this._data.length,
            );
            return true;
        }
        if (event.key === "ArrowDown") {
            this.setSelectedIndex((this.selectedIndex + 1) % this._data.length);
            return true;
        }
        if (event.key === "Enter") {
            if (this._data.length > 0)
                this.onConfirm(this._data[this.selectedIndex]);
            return true;
        }

        return false;
    }

    onExit() {
        this._popup[0].destroy();
        this.component.destroy();
    }

    convertQueryResult(result: Suggestion[]): VerticalMenuItemData[] {
        return result.map((r, i) => ({ index: i, ...r }));
    }
}

function generateSuggestionOptions(
    queryItems: (settings: QuerySettings) => Suggestion[],
    getSelectedIndex: () => number | null,
    setSelectedIndex: (value: any) => void,
): Partial<SuggestionOptions> {
    const renderer = new ReferenceSuggestionRenderer(
        getSelectedIndex,
        setSelectedIndex,
    );
    return {
        //char: "[[",
        items: queryItems,
        render: () => ({
            // wrap the callbacks in arrow functions to ensure that they are bound to the renderer
            onStart: (props: SuggestionProps) => renderer.onStart(props),
            onUpdate: (props: SuggestionProps) => renderer.onUpdate(props),
            onKeyDown: (props: SuggestionKeyDownProps) =>
                renderer.onKeyDown(props),
            onExit: () => renderer.onExit(),
        }),
    };
}

export function useReferenceExtension({
    queryItems,
    getSelectedIndex,
    setSelectedIndex,
}: ReferenceExtensionSettings) {
    const settings: Partial<MentionOptions<QueryResult>> = {
        suggestion: generateSuggestionOptions(
            queryItems,
            getSelectedIndex,
            setSelectedIndex,
        ),
        HTMLAttributes: {
            class: "article-reference",
        },
        renderHTML({ options, node }) {
            return [
                "a",
                mergeAttributes(
                    { "data-type": "reference" },
                    options.HTMLAttributes,
                ),
                `${node.attrs.label ?? node.attrs.id}`,
            ];
        },
    };
    return Mention.configure(settings);
}
