import { makeAutoObservable } from "mobx";

import { DomainService } from "../domain";

export class SettingsEditorService {
    domain: DomainService;

    constructor(domain: DomainService) {
        makeAutoObservable(this, { domain: false });
        this.domain = domain;
    }
}
