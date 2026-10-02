import type { Id } from "@/interface";
import { type DataRow } from "@/lib/components/data-table";

import type { WordTableService } from "./word-table-service.svelte";
import type { WordColumnKey } from "./word-table-constants";
import type { WordProperty, WordType } from "@/api";

export interface WordTypeItem {
    value: WordType;
    label: string;
}

export interface WordTypeSelectItem {
    value: string;
    label: string;
}

export interface WordRowMetaData {
    id: Id | null;
    languageId: Id;
    // positional index of the row in the server-managed result set
    index?: number | null;
}

export type WordRow = DataRow<WordColumnKey, WordRowMetaData>;

export interface WordColumnMetaData {
    property: WordProperty;
}

export interface WordTableProps {
    service: WordTableService | null;
}
