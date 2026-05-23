import type { EntryChangeEvent } from "./entry-events";
import type { ProjectChangeEvent } from "./project-events";

export interface DataChangeEvent {
    project?: ProjectChangeEvent | null;
    entries?: EntryChangeEvent[] | null;
}
