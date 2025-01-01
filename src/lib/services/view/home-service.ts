import { makeAutoObservable } from "mobx";

import { ViewServiceInterface } from "./view-service-interface";

export class HomeService {
    _projectName: string = "";

    view: ViewServiceInterface;

    constructor(view: ViewServiceInterface) {
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
