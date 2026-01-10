import { makeAutoObservable } from "mobx";

import { ICentralPanelContentService } from "@/client/interface";
import { CentralViewType } from "@/constants";

export class SettingsEditorService implements ICentralPanelContentService {
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
