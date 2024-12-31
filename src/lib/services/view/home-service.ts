import { makeAutoObservable } from "mobx";

import { DomainService } from "../domain";

export class HomeService {
    _projectName: string = "";

    domain: DomainService;

    constructor(domain: DomainService) {
        makeAutoObservable(this, { domain: false });
        this.domain = domain;
    }

    get projectName() {
        return this._projectName;
    }

    set projectName(name: string) {
        this._projectName = name;
        if (name) this.domain.session.updateProject(name);
    }

    initialize(name: string) {
        this._projectName = name;
    }
}
