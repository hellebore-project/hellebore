import type { MentionDropdownService } from "./mention-dropdown-service.svelte";

export interface MentionItemData {
    label: string;
}

export interface MentionExtensionArgs<I extends MentionItemData> {
    prefix?: string;
    querier: (arg: string) => Promise<I[]>;
}

export interface MentionProps<I extends MentionItemData> {
    service: MentionDropdownService<I>;
}
