import { makeAutoObservable } from "mobx";
import { createRef, RefObject } from "react";

export class ObservableReference<E extends Element> {
    private _reference: RefObject<E> | null = null;

    constructor() {
        // the reference needs to be observable so that the DOM
        // can react to changes in the underlying component;
        // intended to be used as a dependency of a useEffect hook
        makeAutoObservable(this);
    }

    get exists() {
        return this.reference !== null;
    }

    get reference() {
        return this._reference;
    }

    get current() {
        return this._reference?.current ?? null;
    }

    create() {
        this._reference = createRef();
    }

    clear() {
        this._reference = null;
    }
}
