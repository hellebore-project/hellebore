import { makeAutoObservable } from "mobx";

import { IViewManager } from "@/client/interface";
import { ViewKey } from "@/client/constants";

export class SettingsEditor implements IViewManager {
    constructor() {
        makeAutoObservable(this);
    }

    get key() {
        return ViewKey.Settings;
    }
}
