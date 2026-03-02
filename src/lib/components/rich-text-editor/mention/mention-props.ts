import type { MentionItemData } from "./mention-interface";
import type { MentionDropdownService } from "./mention-dropdown-service.svelte";

export interface MentionProps<I extends MentionItemData> {
    service: MentionDropdownService<I>;
}
