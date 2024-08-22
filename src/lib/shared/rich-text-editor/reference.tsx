import { ComboboxItem } from "@mantine/core";
import Mention, { MentionOptions } from "@tiptap/extension-mention";
import { mergeAttributes, ReactRenderer } from "@tiptap/react";
import {
    SuggestionKeyDownProps,
    SuggestionOptions,
    SuggestionProps,
} from "@tiptap/suggestion";
import tippy from "tippy.js";

import { Dropdown, DropdownSettings } from "../dropdown";

type QueryResult = string;

export interface QuerySettings {
    query: string;
}

export interface ReferenceExtensionSettings {
    getSelectedIndex: () => number | null;
    setSelectedIndex: (value: any) => void;
}

class ReferenceSuggestionRenderer {
    _component: ReactRenderer<typeof Dropdown, DropdownSettings> | null = null;
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

    get component(): ReactRenderer<typeof Dropdown, DropdownSettings> {
        return this._component as ReactRenderer<
            typeof Dropdown,
            DropdownSettings
        >;
    }

    set component(component: ReactRenderer<typeof Dropdown, DropdownSettings>) {
        this._component = component;
    }

    get selectedIndex() {
        return this.getSelectedIndex() ?? 0;
    }

    onStart(props: SuggestionProps) {
        this._data = this.convertQueryResult(props.items);
        this._confirm = props.command;

        const dropdownSettings: DropdownSettings = {
            data: this._data,
            getSelectedIndex: this.getSelectedIndex,
            // use an arrow function to bind onConfirm to the renderer
            confirm: (item) => this.onConfirm(item),
        };

        this.component = new ReactRenderer<typeof Dropdown, DropdownSettings>(
            Dropdown,
            {
                props: dropdownSettings,
                editor: props.editor,
            },
        );

        if (!props.clientRect) return;

        this._popup = tippy("body", {
            getReferenceClientRect: props.clientRect,
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

    onConfirm(item: ComboboxItem) {
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

    convertQueryResult(result: string[]): ComboboxItem[] {
        return result.map((r) => ({ label: r, value: r }));
    }
}

function generateSuggestionOptions(
    getSelectedIndex: () => number | null,
    setSelectedIndex: (value: any) => void,
): Partial<SuggestionOptions> {
    // TODO: make the query function into an arg
    const queryItems = ({ query }: QuerySettings) => {
        return ["A", "B", "C"]
            .filter((item) =>
                item.toLowerCase().startsWith(query.toLowerCase()),
            )
            .slice(0, 5);
    };
    const renderer = new ReferenceSuggestionRenderer(
        getSelectedIndex,
        setSelectedIndex,
    );
    return {
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
    getSelectedIndex,
    setSelectedIndex,
}: ReferenceExtensionSettings) {
    const settings: Partial<MentionOptions<QueryResult>> = {
        suggestion: generateSuggestionOptions(
            getSelectedIndex,
            setSelectedIndex,
        ),
        renderText({ node }) {
            return `${node.attrs.label ?? node.attrs.id}`;
        },
        renderHTML({ options, node }) {
            return [
                "span",
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
