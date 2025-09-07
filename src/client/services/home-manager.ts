import { makeAutoObservable } from "mobx";

import { IClientManager } from "@/client/interface";

export class HomeManager {
    _projectName: string = "";

    view: IClientManager;

    constructor(view: IClientManager) {
        makeAutoObservable(this, { view: false });
        this.view = view;
    }

    get projectName() {
        return this._projectName;
    }

    set projectName(name: string) {
        this._projectName = name;
        if (name) this.view.domain.session.updateProject(name);
    }

    initialize(name: string) {
        this._projectName = name;
    }
}
