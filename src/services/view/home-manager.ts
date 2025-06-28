import { makeAutoObservable } from "mobx";

import { ViewManagerInterface } from "./interface";

export class HomeManager {
    _projectName: string = "";

    view: ViewManagerInterface;

    constructor(view: ViewManagerInterface) {
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
