import { Id } from "@/interface";
import { IClientManager } from "@/client/interface";
import { VerticalSelectionData } from "@/shared/vertical-selection";

import { BaseContextMenu } from "./context-menu.model";

abstract class BaseFileContextMenu extends BaseContextMenu {
    id: Id;
    text: string;

    constructor(id: Id, text: string, data: Partial<VerticalSelectionData>[]) {
        super(data);
        this.id = id;
        this.text = text;
    }
}

export class FolderContextMenu extends BaseFileContextMenu {
    constructor(id: Id, text: string, client: IClientManager) {
        const data: Partial<VerticalSelectionData>[] = [
            {
                label: "Rename",
                onConfirm: () => {
                    return new Promise(() => client.editFolderName(this.id));
                },
            },
            {
                label: "Delete",
                onConfirm: () => {
                    return new Promise(() => client.deleteFolder(this.id));
                },
            },
        ];
        super(id, text, data);
    }
}

export class EntryFileContextMenu extends BaseFileContextMenu {
    constructor(id: Id, text: string, client: IClientManager) {
        const data: Partial<VerticalSelectionData>[] = [
            {
                label: "Delete",
                onConfirm: () => {
                    return new Promise(() =>
                        client.deleteEntry(this.id, this.text),
                    );
                },
            },
        ];
        super(id, text, data);
    }
}
