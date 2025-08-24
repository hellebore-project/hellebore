import { makeAutoObservable } from "mobx";

import { IViewManager } from "@/services/interface";

export class HomeManager {
    _projectName: string = "";

    view: IViewManager;

    constructor(view: IViewManager) {
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
