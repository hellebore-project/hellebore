import { makeAutoObservable } from "mobx";

import { IClientManager } from "@/client/interface";

export class SettingsEditor {
    view: IClientManager;

    constructor(view: IClientManager) {
        makeAutoObservable(this, { view: false });
        this.view = view;
    }
}
