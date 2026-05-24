import type { EntryChangeEvent } from "./entry-events";
import type { FolderChangeEvent } from "./folder-events";
import type { ProjectChangeEvent } from "./project-events";

export interface DataChangeEvent {
    project?: ProjectChangeEvent | null;
    folders?: FolderChangeEvent[] | null;
    entries?: EntryChangeEvent[] | null;
}
