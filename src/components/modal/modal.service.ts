import { makeAutoObservable } from "mobx";

import { ModalType, ROOT_FOLDER_ID } from "@/constants";
import {
    CreateEntryEvent,
    CreateProjectEvent,
    EntryInfoResponse,
    Hookable,
    IComponentService,
    IModalContentManager,
    OpenEntryCreatorEvent,
} from "@/interface";
import { EventProducer, MultiEventProducer } from "@/model";

import {
    EntryCreatorService,
    EntryCreatorReferenceService,
} from "./entry-creator";
import { ProjectCreatorService } from "./project-creator";

export class ModalManager implements IComponentService, Hookable {
    readonly key = "modal";

    // STATE
    private _modalKey: ModalType | null = null;
    content: IModalContentManager | null = null;

    // SERVICES
    entryCreatorReference: EntryCreatorReferenceService;

    // EVENTS
    fetchPortalSelector: EventProducer<void, string>;
    onCreateProject: MultiEventProducer<CreateProjectEvent, unknown>;
    onCreateEntry: EventProducer<
        CreateEntryEvent,
        Promise<EntryInfoResponse | null>
    >;

    constructor() {
        this._modalKey = null;

        this.entryCreatorReference = new EntryCreatorReferenceService();

        this.fetchPortalSelector = new EventProducer();
        this.onCreateProject = new MultiEventProducer();
        this.onCreateEntry = new EventProducer();

        makeAutoObservable(this, {
            content: false,
            entryCreatorReference: false,
            fetchPortalSelector: false,
            onCreateProject: false,
            onCreateEntry: false,
            hooks: false,
        });
    }

    get modalKey() {
        return this._modalKey;
    }

    openProjectCreator() {
        const modal = new ProjectCreatorService();
        modal.onCreateProject.broker = this.onCreateProject;
        modal.initialize();
        this._open(modal);
    }

    openEntryCreator({ entryType, folderId }: OpenEntryCreatorEvent) {
        const modal = new EntryCreatorService(this.entryCreatorReference);

        modal.fetchPortalSelector.broker = this.fetchPortalSelector;
        modal.onCreateEntry.broker = this.onCreateEntry;

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

    // HOOKS

    *hooks() {
        yield* this.entryCreatorReference.hooks();
    }
}
