import { makeAutoObservable } from "mobx";

import { ViewServiceInterface } from "./view-service-interface";

export class SettingsEditorService {
    view: ViewServiceInterface;

    constructor(view: ViewServiceInterface) {
        makeAutoObservable(this, { view: false });
        this.view = view;
    }
}
