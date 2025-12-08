import { makeAutoObservable } from "mobx";

import { DomainManager, EntryInfoResponse, FolderResponse } from "@/domain";

import { FileNavigatorService } from "./file-navigator";

export interface NavigationServiceArgs {
    domain: DomainManager;
}

export class NavigationService {
    readonly NAVBAR_WIDTH = 300;

    private _mobileOpen = true;

    files: FileNavigatorService;

    constructor({ domain }: NavigationServiceArgs) {
        this.files = new FileNavigatorService({ domain });
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

    load(entities: EntryInfoResponse[], folders: FolderResponse[]) {
        this.files.initialize(entities, folders);
    }

    reset() {
        this.files.reset();
    }

    toggleMobileOpen() {
        this._mobileOpen = !this._mobileOpen;
    }
}
