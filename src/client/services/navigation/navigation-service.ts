import { makeAutoObservable } from "mobx";

import { EntryInfoResponse, FolderResponse } from "@/domain/schema";
import { FileNavigator } from "./file-navigator";
import { IClientManager } from "@/client/interface";

export class NavigationService {
    files: FileNavigator;

    constructor(view: IClientManager) {
        makeAutoObservable(this, { files: false });
        this.files = new FileNavigator(view);
    }

    initialize(entities: EntryInfoResponse[], folders: FolderResponse[]) {
        this.files.initialize(entities, folders);
    }

    reset() {
        this.files.reset();
    }
}
