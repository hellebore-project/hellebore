import type { Id } from "@/interface";

export interface BulkEntityResponse {
    entries: Id[];
    folders: Id[];
}
