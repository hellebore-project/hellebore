import { makeAutoObservable } from "mobx";

import { CentralViewType } from "@/constants";
import { ICentralPanelContentService } from "@/interface";
import { DomainManager } from "@/services";

export class HomeManager implements ICentralPanelContentService {
    _projectName = "";

    domain: DomainManager;

    constructor(domain: DomainManager) {
        this.domain = domain;
        makeAutoObservable(this, { domain: false });
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
        if (name) this.domain.session.updateProject(name);
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
