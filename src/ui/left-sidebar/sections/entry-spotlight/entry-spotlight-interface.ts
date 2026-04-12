import type { EntrySpotlightService } from "./entry-spotlight-service.svelte";

export interface SpotlightNodeData {
    rawId: number;
}

export interface EntrySpotlightProps {
    service: EntrySpotlightService;
}
