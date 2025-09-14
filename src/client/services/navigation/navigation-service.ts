import { makeAutoObservable } from "mobx";

import { EntryInfoResponse, FolderResponse } from "@/domain/schema";
import { FileNavigator, FileNavigatorArguments } from "./file-navigator";
import { IClientManager } from "@/client/interface";

export interface NavigationServiceArguments {
    client: IClientManager;
    files: Omit<FileNavigatorArguments, "client">;
}

export class NavigationService {
    files: FileNavigator;

    constructor({ client, files }: NavigationServiceArguments) {
        this.files = new FileNavigator({ client, ...files });
        makeAutoObservable(this, { files: false });
    }

    initialize(entities: EntryInfoResponse[], folders: FolderResponse[]) {
        this.files.initialize(entities, folders);
    }

    reset() {
        this.files.reset();
    }
}
