import { WordType } from "@/constants";
import type { Id, WordKey } from "@/interface";

import type { WordTableService } from "./word-table-service.svelte";
import type { WordColumnKey } from "./word-table-constants";

export type PositionKey = string;

export interface WordCellState {
    value: string;
    oldValue?: string;
}

export interface WordRow {
    key: WordKey;
    wordType: WordType;
    languageId: number;
    id: Id | null;
    cells: Record<WordColumnKey, WordCellState>;
}

export interface SelectionAnchor {
    rowIndex: number;
    colKey: WordColumnKey;
}

export interface WordTableProps {
    service: WordTableService;
}
