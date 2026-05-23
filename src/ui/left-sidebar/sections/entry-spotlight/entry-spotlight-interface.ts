import type { EntrySpotlightService } from "./entry-spotlight-service.svelte";

export interface SpotlightNodeData {
    id: number | null;
    titleChanged: boolean;
    folderIdChanged: boolean;
}

export interface EntrySpotlightProps {
    service: EntrySpotlightService;
}
