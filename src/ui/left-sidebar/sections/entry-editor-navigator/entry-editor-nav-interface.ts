import type { EntryType, EntryViewType } from "@/constants";
import type { Id } from "@/interface";

export interface EntryEditorNavigatorItem {
    label: string;
    value: EntryViewType;
}

interface EntryInfo {
    id: Id;
    type?: EntryType | null;
    title?: string | null;
}

export interface EntryEditorNavigatorServiceArgs {
    ownerId: string;
    entry: EntryInfo;
    activeView?: EntryViewType;
}
