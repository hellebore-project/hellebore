import type { EntrySpotlightService } from "./entry-spotlight-service.svelte";

export interface SpotlightNodeData {
    id: number | null;
}

export interface EntrySpotlightProps {
    service: EntrySpotlightService;
}
