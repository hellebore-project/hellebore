import { Mention, MentionOptions } from "@tiptap/extension-mention";
import { mergeAttributes, ReactRenderer } from "@tiptap/react";
import {
    SuggestionKeyDownProps,
    SuggestionOptions,
    SuggestionProps,
} from "@tiptap/suggestion";
import tippy, { Instance } from "tippy.js";

import {
    VerticalSelection,
    VerticalSelectionData,
    VerticalSelectionProps,
} from "@/components/lib/vertical-selection";

export type ReferenceId = number | string;

export interface ReferenceData {
    id: ReferenceId;
    label: string;
}

type QueryResult = string;
type DOMRectAccessor = () => DOMRect;

export interface SuggestionData {
    label: string;
    value: number | string;
}

export interface QuerySettings {
    query: string;
}

export interface ReferenceExtensionSettings {
    prefix: string;
    queryItems: (
        settings: QuerySettings,
    ) => SuggestionData[] | Promise<SuggestionData[]>;
    getSelectedIndex: () => number | null;
    setSelectedIndex: (value: number | string) => void;
}

class ReferenceSuggestionRenderer {
    _component: ReactRenderer<
        typeof VerticalSelection,
        VerticalSelectionProps
    > | null = null;
    _popup: Instance[];
    _data: VerticalSelectionData[];
    _confirm: ((item: ReferenceData) => void) | null = null;

    getSelectedIndex: () => number | null;
    setSelectedIndex: (value: number | string) => void;

    constructor(
        getSelectedIndex: () => number | null,
        setSelectedIndex: (value: number | string) => void,
    ) {
        this._popup = [];
        this._data = [];
        this.getSelectedIndex = getSelectedIndex;
        this.setSelectedIndex = setSelectedIndex;
    }

    get component(): ReactRenderer<
        typeof VerticalSelection,
        VerticalSelectionProps
    > {
        return this._component as ReactRenderer<
            typeof VerticalSelection,
            VerticalSelectionProps
        >;
    }

    set component(
        component: ReactRenderer<
            typeof VerticalSelection,
            VerticalSelectionProps
        >,
    ) {
        this._component = component;
    }

    get selectedIndex() {
        return this.getSelectedIndex() ?? 0;
    }

    onStart(props: SuggestionProps) {
        this._data = this.convertQueryResult(props.items);
        this._confirm = props.command;

        const dropdownProps: VerticalSelectionProps = {
            data: this._data,
            getSelectedIndex: this.getSelectedIndex,
            onConfirm: (_, item) => this.onConfirm(item),
            placeholder: "No results",
            withBorder: true,
            radius: 0,
            itemProps: {
                onMouseOver: (e) =>
                    this.setSelectedIndex(
                        Number(e.currentTarget.getAttribute("data-index")),
                    ),
            },
        };

        this.component = new ReactRenderer<
            typeof VerticalSelection,
            VerticalSelectionProps
        >(VerticalSelection, {
            props: dropdownProps,
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
            // @ts-expect-error: `props.clientRect` is typed as potentially returning null
            getReferenceClientRect: props.clientRect,
        });
    }

    async onConfirm(item: VerticalSelectionData) {
        if (item)
            this._confirm?.({
                id: item.value as ReferenceId,
                label: item.label,
            });
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

    convertQueryResult(result: SuggestionData[]): VerticalSelectionData[] {
        return result.map((r, i) => ({
            className: "rich-text-reference-item",
            index: i,
            ...r,
        }));
    }
}

function generateSuggestionOptions(
    prefix: string,
    queryItems: (
        settings: QuerySettings,
    ) => SuggestionData[] | Promise<SuggestionData[]>,
    getSelectedIndex: () => number | null,
    setSelectedIndex: (value: number | string) => void,
): Partial<SuggestionOptions> {
    const renderer = new ReferenceSuggestionRenderer(
        getSelectedIndex,
        setSelectedIndex,
    );
    return {
        char: prefix,
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
    prefix,
    queryItems,
    getSelectedIndex,
    setSelectedIndex,
}: ReferenceExtensionSettings) {
    const settings: Partial<MentionOptions<QueryResult>> = {
        suggestion: generateSuggestionOptions(
            prefix,
            queryItems,
            getSelectedIndex,
            setSelectedIndex,
        ),
        HTMLAttributes: {
            class: "rich-text-reference",
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
