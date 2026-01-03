import { makeAutoObservable } from "mobx";

import { DomainManager, EntryInfoResponse, FolderResponse } from "@/domain";

import { SpotlightService } from "./spotlight";

export interface NavigationServiceArgs {
    domain: DomainManager;
}

export class NavigationService {
    readonly NAVBAR_WIDTH = 300;

    private _mobileOpen = true;

    spotlight: SpotlightService;

    constructor({ domain }: NavigationServiceArgs) {
        this.spotlight = new SpotlightService({ domain });
        makeAutoObservable(this, { spotlight: false });
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
        this.spotlight.load(entities, folders);
    }

    reset() {
        this.spotlight.cleanUp();
    }

    toggleMobileOpen() {
        this._mobileOpen = !this._mobileOpen;
    }
}
