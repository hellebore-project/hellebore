import { makeAutoObservable } from "mobx";

import { DomainManager } from "@/domain";
import { IViewManager } from "@/client/interface";
import { ViewKey } from "@/client/constants";

type PrivateKeys = "_domain";

export class HomeManager implements IViewManager {
    _projectName = "";

    private _domain: DomainManager;

    constructor(domain: DomainManager) {
        this._domain = domain;
        makeAutoObservable<HomeManager, PrivateKeys>(this, { _domain: false });
    }

    get key() {
        return ViewKey.Home;
    }

    get projectName() {
        return this._projectName;
    }

    set projectName(name: string) {
        this._projectName = name;
        if (name) this._domain.session.updateProject(name);
    }

    initialize(name: string) {
        this._projectName = name;
    }
}
