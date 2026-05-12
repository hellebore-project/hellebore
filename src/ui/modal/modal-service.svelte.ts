import { ModalType } from "@/constants";
import type {
    CreateEntryEvent,
    CreateProjectEvent,
    EntryInfoResponse,
    IComponentService,
    IModalContentManager,
    OpenEntryCreatorEvent,
} from "@/interface";
import { EventProducer, MultiEventProducer } from "@/utils/event-producer";

import { EntryCreatorService } from "./entry-creator";
import { ProjectCreatorService } from "./project-creator";

interface ModalContentManager extends IModalContentManager {
    key: ModalType;
}

export class ModalManager implements IComponentService {
    readonly id = "modal";

    open = $state(false);
    private _modalKey: ModalType | null = $state(null);
    content: ModalContentManager | null = $state(null);

    onCreateProject: MultiEventProducer<CreateProjectEvent, unknown>;
    onCreateEntry: EventProducer<
        CreateEntryEvent,
        Promise<EntryInfoResponse | null>
    >;

    constructor() {
        this.onCreateProject = new MultiEventProducer();
        this.onCreateEntry = new EventProducer();
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
        const modal = new EntryCreatorService();
        modal.onCreateEntry.broker = this.onCreateEntry;
        modal.initialize(entryType, folderId);
        this._open(modal);
    }

    private _open(modal: ModalContentManager) {
        modal.onClose.subscribe(() => this.close());
        this.content = modal;
        this._modalKey = modal.key;
        this.open = true;
    }

    onOpenChange(isOpen: boolean) {
        if (!isOpen) {
            this.close();
            return;
        }

        this.open = true;
    }

    close() {
        this.open = false;
        this.content = null;
        this._modalKey = null;
    }
}
