import { makeAutoObservable } from "mobx";

import { IClientManager } from "@/client/interface";

type PrivateKeys = "_client";

export class HomeManager {
    _projectName = "";

    private _client: IClientManager;

    constructor(client: IClientManager) {
        this._client = client;
        makeAutoObservable<HomeManager, PrivateKeys>(this, { _client: false });
    }

    get projectName() {
        return this._projectName;
    }

    set projectName(name: string) {
        this._projectName = name;
        if (name) this._client.domain.session.updateProject(name);
    }

    initialize(name: string) {
        this._projectName = name;
    }
}
