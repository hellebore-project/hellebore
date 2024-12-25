import { makeAutoObservable } from "mobx";

import { DomainService } from "./domain";

export class ProjectCreatorService {
    _name: string = "";
    _dbFilePath: string = "";

    domain: DomainService;

    constructor(domain: DomainService) {
        makeAutoObservable(this, { domain: false });
        this.domain = domain;
    }

    get name() {
        return this._name;
    }

    set name(name: string) {
        this._name = name;
    }

    get dbFilePath() {
        return this._dbFilePath;
    }

    set dbFilePath(path: string) {
        this._dbFilePath = path;
    }

    initialize() {
        this._name = "";
        this._dbFilePath = "";
    }

    reset() {
        this._name = "";
        this._dbFilePath = "";
    }
}
