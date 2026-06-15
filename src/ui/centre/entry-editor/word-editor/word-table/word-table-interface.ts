import type { Id, WordKey } from "@/interface";
import type { CellState } from "@/lib/components/data-table";

import type { WordTableService } from "./word-table-service.svelte";
import type { WordColumnKey } from "./word-table-constants";

// TODO: collapse this into DataRow
export interface WordRow {
    id: Id | null;
    key: WordKey;
    languageId: Id;
    filterable?: boolean;
    cells: Record<WordColumnKey, CellState>;
}

export interface WordTableProps {
    service: WordTableService | null;
}
