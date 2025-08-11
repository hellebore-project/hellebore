import { makeAutoObservable } from "mobx";

import { EntityInfoResponse, FolderResponse } from "@/interface";
import { FileNavigator } from "./file-navigator";
import { ViewManagerInterface } from "../interface";

export class NavigationService {
    files: FileNavigator;

    constructor(view: ViewManagerInterface) {
        makeAutoObservable(this, { files: false });
        this.files = new FileNavigator(view);
    }

    initialize(entities: EntityInfoResponse[], folders: FolderResponse[]) {
        this.files.initialize(entities, folders);
    }

    reset() {
        this.files.reset();
    }
}
