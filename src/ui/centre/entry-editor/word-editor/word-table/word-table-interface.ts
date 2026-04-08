import type { Id, WordKey } from "@/interface";
import type { CellState } from "@/lib/components/data-table";

import type { WordTableService } from "./word-table-service.svelte";
import type { WordColumnKey } from "./word-table-constants";

export interface WordRow {
    key: WordKey;
    filterable?: boolean;
    languageId: number;
    id: Id | null;
    cells: Record<WordColumnKey, CellState>;
}

export interface WordTableProps {
    service: WordTableService;
}
