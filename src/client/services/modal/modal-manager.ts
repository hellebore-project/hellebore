import { makeAutoObservable } from "mobx";

import { ModalType } from "@/client/constants";
import {
    CreateEntryEvent,
    CreateProjectEvent,
    IModalContentManager,
    OpenEntryCreatorEvent,
} from "@/client/interface";
import { EntryInfoResponse, ROOT_FOLDER_ID } from "@/domain";
import { EventProducer } from "@/utils/event";

import { EntryCreatorService } from "./entry-creator";
import { ProjectCreatorService } from "./project-creator";

export class ModalManager {
    private _modalKey: ModalType | null = null;
    content: IModalContentManager | null = null;

    // EVENTS
    fetchPortalSelector: EventProducer<void, string>;
    onCreateProject: EventProducer<CreateProjectEvent, unknown>;
    onCreateEntry: EventProducer<
        CreateEntryEvent,
        Promise<EntryInfoResponse | null>
    >;

    constructor() {
        this._modalKey = null;

        this.fetchPortalSelector = new EventProducer();
        this.onCreateProject = new EventProducer();
        this.onCreateEntry = new EventProducer();

        makeAutoObservable(this, {
            content: false,
            fetchPortalSelector: false,
            onCreateProject: false,
            onCreateEntry: false,
        });
    }

    get modalKey() {
        return this._modalKey;
    }

    openProjectCreator() {
        const modal = new ProjectCreatorService();
        modal.onCreateProject.subscriptions =
            this.onCreateProject.subscriptions;
        modal.initialize();
        this._open(modal);
    }

    openEntryCreator({ entryType, folderId }: OpenEntryCreatorEvent) {
        const modal = new EntryCreatorService();

        modal.fetchPortalSelector.broker = this.fetchPortalSelector;
        modal.onCreateEntry.subscriptions = this.onCreateEntry.subscriptions;

        modal.initialize(entryType, folderId ?? ROOT_FOLDER_ID);

        this._open(modal);
    }

    private _open(modal: IModalContentManager) {
        modal.onClose.subscribe(() => this.close());
        this.content = modal;
        this._modalKey = modal.key as ModalType;
    }

    close() {
        this.content = null;
        this._modalKey = null;
    }
}
