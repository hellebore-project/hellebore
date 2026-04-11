import type { MentionDropdownService } from "./mention-dropdown-service.svelte";

export interface BaseMentionItemData {
    label: string;
}

export interface MentionItemData<T> extends BaseMentionItemData {
    data?: T;
}

export interface MentionExtensionArgs<T> {
    prefix?: string;
    querier: (arg: string) => Promise<(BaseMentionItemData & T)[]>;
}

export interface MentionProps<T> {
    service: MentionDropdownService<T>;
}
