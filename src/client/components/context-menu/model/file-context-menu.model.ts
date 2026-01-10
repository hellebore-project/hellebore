import {
    DeleteEntryEvent,
    DeleteFolderEvent,
    EditFolderNameEvent,
    Id,
} from "@/interface";
import { MultiEventProducer } from "@/model";

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
    onRename: MultiEventProducer<EditFolderNameEvent, unknown>;
    onDelete: MultiEventProducer<DeleteFolderEvent, unknown>;

    constructor(id: Id, text: string) {
        super(id, text);
        this.onRename = new MultiEventProducer();
        this.onDelete = new MultiEventProducer();
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
    onDelete: MultiEventProducer<DeleteEntryEvent, unknown>;

    constructor(id: Id, text: string) {
        super(id, text);
        this.onDelete = new MultiEventProducer();
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
