import { makeAutoObservable } from "mobx";

import { EntryInfoResponse, FolderResponse } from "@/domain/schema";
import { IClientManager } from "@/client/interface";

import { FileNavigator, FileNavigatorArguments } from "./file-navigator";

export interface NavigationServiceArguments {
    client: IClientManager;
    files: Omit<FileNavigatorArguments, "client">;
}

export class NavigationService {
    readonly NAVBAR_WIDTH = 300;

    private _mobileOpen = true;

    files: FileNavigator;

    constructor({ client, files }: NavigationServiceArguments) {
        this.files = new FileNavigator({ client, ...files });
        makeAutoObservable(this, { files: false });
    }

    get width() {
        return this.NAVBAR_WIDTH;
    }

    get mobileOpen() {
        return this._mobileOpen;
    }

    set mobileOpen(open: boolean) {
        this._mobileOpen = open;
    }

    initialize(entities: EntryInfoResponse[], folders: FolderResponse[]) {
        this.files.initialize(entities, folders);
    }

    reset() {
        this.files.reset();
    }

    toggleMobileOpen() {
        this._mobileOpen = !this._mobileOpen;
    }
}
