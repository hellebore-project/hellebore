import type { Id, WordKey } from "@/interface";
import type { CellState } from "@/lib/components/data-table";

import type { WordTableService } from "./word-table-service.svelte";
import type { WordColumnKey } from "./word-table-constants";

export interface WordRow {
    id: Id | null;
    key: WordKey;
    languageId: number;
    filterable?: boolean;
    cells: Record<WordColumnKey, CellState>;
}

export interface WordTableProps {
    service: WordTableService | null;
}
