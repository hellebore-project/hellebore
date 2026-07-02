/* eslint-disable @typescript-eslint/no-explicit-any */
import { mount, unmount } from "svelte";
import { mergeAttributes } from "@tiptap/core";
import { Mention as MentionPrimitive } from "@tiptap/extension-mention";
import type {
    SuggestionOptions,
    SuggestionProps,
    SuggestionKeyDownProps,
} from "@tiptap/suggestion";

import { SHARED_PORTAL_SELECTOR } from "@/constants";

import MentionComponent from "./mention-dropdown.svelte";
import type {
    MentionExtensionArgs,
    MentionItemData,
} from "./mention-interface";
import { MentionDropdownService } from "./mention-dropdown-service.svelte";

interface MentionItemsArgs {
    query: string;
}

export class MentionService<T> {
    private _prefix: string;
    private _querier: (arg: string) => Promise<MentionItemData<T>[]>;

    dropdown: MentionDropdownService<T> | null = null;

    private _dropdownElement: any | null = null;
    private _containerElement: HTMLElement | null = null;

    constructor({ prefix = "@", querier }: MentionExtensionArgs<T>) {
        this._prefix = prefix;
        this._querier = querier;
    }

    createExtension() {
        const suggestion = {
            char: this._prefix,
            startOfLine: false,
            items: async ({ query }: MentionItemsArgs) => {
                return this._querier(query);
            },
            render: () => this._renderSuggestions(),
        };

        return MentionPrimitive.configure({
            // @ts-expect-error: no clue why typescript is complaining here
            suggestion,
            HTMLAttributes: { class: "text-blue-500 cursor-pointer" },
            renderHTML({ options, node }) {
                return [
                    "a",
                    mergeAttributes(
                        { "data-type": "mention" },
                        options.HTMLAttributes,
                    ),
                    `${node.attrs.label ?? node.attrs.id}`,
                ];
            },
        });
    }

    private _renderSuggestions() {
        return {
            onStart: this._onStart.bind(this),
            onUpdate: this._onUpdate.bind(this),
            onKeyDown: this._onKeyDown.bind(this),
            onExit: this._onExit.bind(this),
        } as unknown as SuggestionOptions<
            MentionItemData<T>,
            MentionItemData<T>
        >;
    }

    private _onStart(
        props: SuggestionProps<MentionItemData<T>, MentionItemData<T>>,
    ) {
        this.dropdown = new MentionDropdownService(props);

        this._containerElement = document.createElement("div");
        // @ts-ignore: TS2635 TS2345
        this._dropdownElement = mount(MentionComponent<T>, {
            target: this._containerElement,
            props: { service: this.dropdown },
        });

        if (!props.clientRect) return;

        this._containerElement.style.position = "absolute";

        const target =
            document.querySelector(SHARED_PORTAL_SELECTOR) ?? document.body;
        target.appendChild(this._containerElement);

        this._updatePosition(this._containerElement, props.clientRect());
    }

    private _onUpdate(
        props: SuggestionProps<MentionItemData<T>, MentionItemData<T>>,
    ) {
        if (this.dropdown) this.dropdown.suggestion = props;
        if (this._containerElement && props.clientRect)
            this._updatePosition(this._containerElement, props.clientRect());
    }

    private _onKeyDown(props: SuggestionKeyDownProps) {
        if (this._dropdownElement && this.dropdown)
            return this.dropdown.handleKeyDown(props.event);
        return false;
    }

    private _onExit() {
        if (this._dropdownElement) unmount(this._dropdownElement);
        this._containerElement?.remove();
        this._containerElement = null;
        this._dropdownElement = null;
    }

    private _updatePosition(element: HTMLElement, clientRect: DOMRect | null) {
        if (!clientRect) return;

        element.style.position = "absolute";
        element.style.left = `${clientRect.left}px`;
        element.style.top = `${clientRect.bottom + 8}px`;
        element.style.zIndex = "1000";
    }
}
