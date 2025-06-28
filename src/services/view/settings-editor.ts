import { makeAutoObservable } from "mobx";

import { ViewManagerInterface } from "./interface";

export class SettingsEditor {
    view: ViewManagerInterface;

    constructor(view: ViewManagerInterface) {
        makeAutoObservable(this, { view: false });
        this.view = view;
    }
}
