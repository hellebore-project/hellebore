import { Id, Point } from "@/interface";

// FOLDER EVENTS

export interface EditFolderNameEvent {
    id: Id;
}

export interface DeleteFolderEvent {
    id: Id;
    name: string;
}

// ENTRY EVENTS

export interface DeleteEntryEvent {
    id: Id;
    title: string;
}

// CONTEXT MENU EVENTS

export interface OpenContextMenuEvent {
    position: Point;
}

export interface OpenFileContextMenuEvent extends OpenContextMenuEvent {
    id: Id;
    text: string;
}
