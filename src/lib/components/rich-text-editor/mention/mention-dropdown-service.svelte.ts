import type {
    SuggestionKeyDownProps,
    SuggestionProps,
} from "@tiptap/suggestion";

import type { MentionItemData } from "./mention-interface";

export class MentionDropdownService<I extends MentionItemData> {
    suggestion: SuggestionProps<I, I>;
    private _selectedIndex: number = $state(0);

    constructor(suggestion: SuggestionProps<I, I>) {
        this.suggestion = $state(suggestion);
    }

    get length() {
        if (!this.suggestion.items) return 0;
        return this.suggestion.items.length;
    }

    get items() {
        return this.suggestion.items;
    }

    get selectedIndex() {
        if (!this.length) this.selectedIndex = 0;
        return this._selectedIndex;
    }

    set selectedIndex(idx: number) {
        this._selectedIndex = idx;
    }

    select(item: I) {
        this.suggestion.command(item);
    }

    onKeyDown(props: SuggestionKeyDownProps) {
        const { event } = props;

        if (event.key === "ArrowDown") {
            if (this._selectedIndex < this.suggestion.items.length - 1) {
                this._selectedIndex += 1;
                return true;
            }
        } else if (event.key === "ArrowUp") {
            if (this._selectedIndex > 0) {
                this._selectedIndex -= 1;
                return true;
            }
        } else if (event.key === "Enter") {
            this.select(this.suggestion.items[this._selectedIndex]);
            return true;
        }

        return false;
    }
}
