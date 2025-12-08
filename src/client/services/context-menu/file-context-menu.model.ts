import {
    DeleteEntryEvent,
    DeleteFolderEvent,
    EditFolderNameEvent,
} from "@/client/interface";
import { Id } from "@/interface";
import { EventProducer } from "@/utils/event";

import { BaseContextMenuService } from "./base-context-menu.model";

abstract class BaseFileContextMenuService extends BaseContextMenuService {
    id: Id;
    text: string;

    constructor(id: Id, text: string) {
        super();
        this.id = id;
        this.text = text;
    }
}

export class FolderContextMenuService extends BaseFileContextMenuService {
    onRename: EventProducer<EditFolderNameEvent, unknown>;
    onDelete: EventProducer<DeleteFolderEvent, unknown>;

    constructor(id: Id, text: string) {
        super(id, text);
        this.onRename = new EventProducer();
        this.onDelete = new EventProducer();
    }

    protected _generateMenuData() {
        return [
            {
                label: "Rename",
                onConfirm: async () => this.onRename.produce({ id: this.id }),
            },
            {
                label: "Delete",
                onConfirm: async () =>
                    this.onDelete.produce({ id: this.id, name: this.text }),
            },
        ];
    }
}

export class EntryFileContextMenuService extends BaseFileContextMenuService {
    onDelete: EventProducer<DeleteEntryEvent, unknown>;

    constructor(id: Id, text: string) {
        super(id, text);
        this.onDelete = new EventProducer();
    }

    protected _generateMenuData() {
        return [
            {
                label: "Delete",
                onConfirm: async () =>
                    this.onDelete.produce({ id: this.id, title: this.text }),
            },
        ];
    }
}
