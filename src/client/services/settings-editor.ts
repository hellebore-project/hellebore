import { makeAutoObservable } from "mobx";

import { IClientManager, IViewManager } from "@/client/interface";
import { ViewKey } from "@/client/constants";

type PrivateKeys = "_client";

export class SettingsEditor implements IViewManager {
    _client: IClientManager;

    constructor(client: IClientManager) {
        this._client = client;
        makeAutoObservable<SettingsEditor, PrivateKeys>(this, {
            _client: false,
        });
    }

    get key() {
        return ViewKey.Settings;
    }
}
