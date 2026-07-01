import type { Id } from "@/interface";

export interface BulkEntryResponse {
    entries: Id[];
    folders: Id[];
}
