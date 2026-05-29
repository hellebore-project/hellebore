import type { Id } from "@/interface/common";

export interface BulkFileResponse {
    entries: Id[];
    folders: Id[];
}
