import { makeAutoObservable } from "mobx";

import { ModalKey } from "@/client/constants";
import {
    CreateEntryEvent,
    CreateProjectEvent,
    IModalContentManager,
    OpenEntryCreatorEvent,
} from "@/client/interface";
import { EntryInfoResponse, ROOT_FOLDER_ID } from "@/domain";
import { EventProducer } from "@/utils/event";

import { EntryCreator } from "./entry-creator";
import { ProjectCreator } from "./project-creator";

export class ModalManager {
    private _modalKey: ModalKey | null = null;
    content: IModalContentManager | null = null;

    // EVENTS
    onCreateProject: EventProducer<CreateProjectEvent, unknown>;
    onCreateEntry: EventProducer<
        CreateEntryEvent,
        Promise<EntryInfoResponse | null>
    >;

    constructor() {
        this._modalKey = null;

        this.onCreateProject = new EventProducer();
        this.onCreateEntry = new EventProducer();

        makeAutoObservable(this, {
            content: false,
            onCreateProject: false,
            onCreateEntry: false,
        });
    }

    get modalKey() {
        return this._modalKey;
    }

    openProjectCreator() {
        const modal = new ProjectCreator();
        modal.onCreateProject.subscriptions =
            this.onCreateProject.subscriptions;
        modal.initialize();
        this._open(modal);
    }

    openEntryCreator({ entityType, folderId }: OpenEntryCreatorEvent) {
        const modal = new EntryCreator();
        modal.onCreateEntry.subscriptions = this.onCreateEntry.subscriptions;
        modal.initialize(entityType, folderId ?? ROOT_FOLDER_ID);
        this._open(modal);
    }

    private _open(modal: IModalContentManager) {
        modal.onClose.subscribe(() => this.close());
        this.content = modal;
        this._modalKey = modal.key as ModalKey;
    }

    close() {
        this.content = null;
        this._modalKey = null;
    }
}
