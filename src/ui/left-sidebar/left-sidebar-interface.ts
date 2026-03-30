import type { ISidebarSectionService } from "@/interface";
import type { LeftSidebarService } from "./left-sidebar-service.svelte";

export interface LeftSidebarSectionProps {
    service: ISidebarSectionService;
}

export interface LeftSidebarProps {
    service: LeftSidebarService;
}
