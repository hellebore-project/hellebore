/* eslint-disable @typescript-eslint/no-explicit-any */
import { mount, unmount } from "svelte";
import { mergeAttributes } from "@tiptap/core";
import { Mention as MentionPrimitive } from "@tiptap/extension-mention";
import type {
    SuggestionOptions,
    SuggestionProps,
    SuggestionKeyDownProps,
} from "@tiptap/suggestion";

import MentionComponent from "./mention-dropdown.svelte";
import type {
    MentionExtensionArgs,
    MentionItemData,
} from "./mention-interface";
import { MentionDropdownService } from "./mention-dropdown-service.svelte";

function _updatePosition(element: HTMLElement, clientRect: DOMRect | null) {
    if (!clientRect) return;

    element.style.position = "absolute";
    element.style.left = `${clientRect.left}px`;
    element.style.top = `${clientRect.bottom + 8}px`;
    element.style.zIndex = "1000";
}

interface ItemsArgs {
    query: string;
}

export function Mention<T>({ prefix = "@", querier }: MentionExtensionArgs<T>) {
    const suggestion = {
        char: prefix,
        startOfLine: false,

        async items({ query }: ItemsArgs) {
            return querier(query);
        },

        render: () => {
            let component: any | null = null;
            let service: MentionDropdownService<T> | null = null;
            let popupElement: HTMLElement | null = null;

            return {
                onStart: (
                    props: SuggestionProps<
                        MentionItemData<T>,
                        MentionItemData<T>
                    >,
                ) => {
                    service = new MentionDropdownService(props);

                    popupElement = document.createElement("div");
                    component = mount(MentionComponent<T>, {
                        target: popupElement,
                        props: { service },
                    });

                    if (!props.clientRect) return;

                    popupElement.style.position = "absolute";
                    document.body.appendChild(popupElement);
                    _updatePosition(popupElement, props.clientRect());
                },

                onUpdate: (
                    props: SuggestionProps<
                        MentionItemData<T>,
                        MentionItemData<T>
                    >,
                ) => {
                    if (service) {
                        service.suggestion = props;
                    }
                    if (popupElement && props.clientRect) {
                        _updatePosition(popupElement, props.clientRect());
                    }
                },

                onKeyDown: (props: SuggestionKeyDownProps) => {
                    if (
                        component &&
                        "onKeyDown" in component &&
                        typeof (component as any)["onKeyDown"] === "function"
                    ) {
                        return (component as any).onKeyDown(props);
                    }
                    return false;
                },

                onExit: () => {
                    if (component) {
                        unmount(component);
                    }
                    popupElement?.remove();
                    popupElement = null;
                    component = null;
                },
            };
        },
    } as unknown as SuggestionOptions<MentionItemData<T>, MentionItemData<T>>;

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
