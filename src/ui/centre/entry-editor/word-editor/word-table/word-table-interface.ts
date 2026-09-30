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

export interface WordRow extends DataRow<WordColumnKey> {
    id: Id | null;
    languageId: Id;
}

export interface WordColumnMetaData {
    property: WordProperty;
}

export interface WordTableProps {
    service: WordTableService | null;
}
