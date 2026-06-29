import type { Id } from "@/interface/common";
import type { EntrySpotlightService } from "./entry-spotlight-service.svelte";

export interface DeleteNodeResult {
    canDelete: boolean;
    reason?: string | null;
}

export interface SpotlightNodeData {
    id: Id | null;
    titleChanged: boolean;
    folderIdChanged: boolean;
}

export interface EntrySpotlightProps {
    service: EntrySpotlightService;
}
