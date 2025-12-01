import { makeAutoObservable } from "mobx";

import { ICentralPanelContentManager } from "@/client/interface";
import { CentralViewType } from "@/client/constants";

export class SettingsEditor implements ICentralPanelContentManager {
    constructor() {
        makeAutoObservable(this);
    }

    get key() {
        return this.type;
    }

    get type() {
        return CentralViewType.Settings;
    }

    get details() {
        return { type: this.type };
    }

    activate() {
        return;
    }

    cleanUp() {
        return;
    }
}
