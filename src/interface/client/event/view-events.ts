import { EntryViewType, SidebarSectionType, ViewAction } from "@/constants";
import type { EntryType } from "@/api";

import type { Id, Point } from "../../common";
import type { CentralPanelInfo } from "../service";

export interface OpenEntryCreatorEvent {
    entryType?: EntryType;
    folderId?: Id;
}

interface OpenCentralPanelEvent {
    focus?: boolean;
}

export interface OpenEntryEditorEvent extends OpenCentralPanelEvent {
    id: Id;
    viewKey?: EntryViewType;
}

export interface ChangeCentralPanelEvent {
    action: ViewAction;
    details: CentralPanelInfo;
}

export interface ChangeEntryEditorViewEvent {
    panelId: string;
    type: EntryViewType;
}

export interface AddSidebarSectionEvent {
    ownerId: string;
}

export interface AddEntryEditorNavigatorEvent extends AddSidebarSectionEvent {
    entry: {
        id: Id;
        type: EntryType | null;
        title: string | null;
    };
    activeView: EntryViewType;
}

export interface ReleaseSidebarSectionEvent {
    ownerId: string;
    type: SidebarSectionType;
}

export interface OpenContextMenuEvent {
    position: Point;
}

export interface OpenFileContextMenuEvent extends OpenContextMenuEvent {
    id: Id;
    text: string;
}
