import { makeAutoObservable } from "mobx";

import { CentralViewType } from "@/client/constants";
import { ICentralPanelContentManager } from "@/client/interface";
import { DomainManager } from "@/domain";

type PrivateKeys = "_domain";

export class HomeManager implements ICentralPanelContentManager {
    _projectName = "";

    private _domain: DomainManager;

    constructor(domain: DomainManager) {
        this._domain = domain;
        makeAutoObservable<HomeManager, PrivateKeys>(this, { _domain: false });
    }

    get key() {
        return this.type;
    }

    get type() {
        return CentralViewType.Home;
    }

    get details() {
        return { type: this.type };
    }

    get projectName() {
        return this._projectName;
    }

    set projectName(name: string) {
        this._projectName = name;
        if (name) this._domain.session.updateProject(name);
    }

    load(name: string) {
        this._projectName = name;
    }

    activate() {
        return;
    }

    cleanUp() {
        return;
    }
}
