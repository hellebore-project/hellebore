import { makeAutoObservable } from "mobx";

import { DomainManager, EntryInfoResponse, FolderResponse } from "@/domain";

import { FileNavigator, FileNavigatorArguments } from "./file-navigator";

export interface NavigationServiceArguments {
    domain: DomainManager;
    files: Omit<FileNavigatorArguments, "domain">;
}

export class NavigationService {
    readonly NAVBAR_WIDTH = 300;

    private _mobileOpen = true;

    files: FileNavigator;

    constructor({ domain, files }: NavigationServiceArguments) {
        this.files = new FileNavigator({ domain, ...files });
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
