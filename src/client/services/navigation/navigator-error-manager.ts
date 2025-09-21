import { makeAutoObservable } from "mobx";

import { Rectangle } from "@/interface";

export class NavigatorErrorManager {
    private _visible: boolean = false;
    private _message: string = "";
    private _position: Rectangle | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    get visible() {
        return this._visible;
    }

    set visible(visible: boolean) {
        this._visible = visible;
    }

    get message() {
        return this._message;
    }

    set message(message: string) {
        this._message = message;
    }

    get position() {
        return this._position;
    }

    set position(pos: Rectangle | null) {
        this._position = pos;
    }

    open(message: string, position: Rectangle) {
        this.visible = true;
        this.message = message;
        this.position = position;
    }

    close() {
        this.visible = false;
        this.message = "";
        this.position = null;
    }
}
