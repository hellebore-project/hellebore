import { makeAutoObservable } from "mobx";

import { EntryInfoResponse, FolderResponse } from "@/interface";
import { FileNavigator } from "./file-navigator";
import { ViewManagerInterface } from "../interface";

export class NavigationService {
    files: FileNavigator;

    constructor(view: ViewManagerInterface) {
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
