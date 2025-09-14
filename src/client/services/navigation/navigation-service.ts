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
        makeAutoObservable(this, { files: false });
        this.files = new FileNavigator({ client, ...files });
    }

    initialize(entities: EntryInfoResponse[], folders: FolderResponse[]) {
        this.files.initialize(entities, folders);
    }

    reset() {
        this.files.reset();
    }
}
