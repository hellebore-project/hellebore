import { makeAutoObservable } from "mobx";

import { IClientManager } from "@/client/interface";

type PrivateKeys = "_client";

export class SettingsEditor {
    _client: IClientManager;

    constructor(client: IClientManager) {
        this._client = client;
        makeAutoObservable<SettingsEditor, PrivateKeys>(this, {
            _client: false,
        });
    }
}
