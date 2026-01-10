import { makeAutoObservable } from "mobx";

import { Hook } from "@/interface";

export class HookManager {
    private _hooks: Hook[];

    constructor() {
        this._hooks = [];
        makeAutoObservable(this);
    }

    register(hook: Hook) {
        this._hooks.push(hook);
    }

    call() {
        this._hooks.forEach((h) => h.call());
    }
}
