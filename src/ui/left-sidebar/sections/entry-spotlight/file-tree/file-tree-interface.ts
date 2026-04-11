import type { EntrySpotlightService } from "../entry-spotlight-service.svelte";

export interface FileTreeProps {
    service: EntrySpotlightService;
    parentId?: string;
    depth?: number;
}
