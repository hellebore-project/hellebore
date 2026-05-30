import type { EntryViewType } from "@/constants";
import type { Id } from "@/interface";
import type { EntryType } from "@/api";

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
