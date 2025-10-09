import { makeAutoObservable } from "mobx";

import { IClientManager, IViewManager } from "@/client/interface";
import { ViewKey } from "@/client/constants";

type PrivateKeys = "_client";

export class HomeManager implements IViewManager {
    _projectName = "";

    private _client: IClientManager;

    constructor(client: IClientManager) {
        this._client = client;
        makeAutoObservable<HomeManager, PrivateKeys>(this, { _client: false });
    }

    get key() {
        return ViewKey.Home;
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
