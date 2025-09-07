import { makeAutoObservable } from "mobx";

import { IViewManager } from "@/client/interface";

export class SettingsEditor {
    view: IViewManager;

    constructor(view: IViewManager) {
        makeAutoObservable(this, { view: false });
        this.view = view;
    }
}
