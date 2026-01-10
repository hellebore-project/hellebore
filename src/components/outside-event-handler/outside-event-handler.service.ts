import { addEventListener } from "consolidated-events";
import { makeAutoObservable } from "mobx";
import { createRef, RefObject, useEffect } from "react";

import { MultiEventProducer } from "@/utils/event-producer";
import { Hookable, IComponentService } from "@/interface";

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
const MOUSE_DOWN_EVENT = "mousedown";
const MOUSE_UP_EVENT = "mouseup";

type PrivateKeys = "_key" | "_ref" | "_removeMouseDown" | "_removeMouseUp";

type RemoveEventListener = () => void;

interface OutsideEventHandlerServiceArgs {
    key: string;
    enabled?: boolean;
    ref?: RefObject<HTMLDivElement>;
}

export class OutsideEventHandlerService implements IComponentService, Hookable {
    private _key: string;
    private _enabled: boolean;
    /** Set by the handler itself, so passing a null reference is acceptable. */
    private _ref: RefObject<HTMLDivElement>;

    onTrigger: MultiEventProducer<Event, void>;
    private _removeMouseDown: RemoveEventListener | null = null;
    private _removeMouseUp: RemoveEventListener | null = null;

    constructor({ key, ref, enabled = true }: OutsideEventHandlerServiceArgs) {
        this._key = key;
        this._enabled = enabled;

        this._ref = ref ?? createRef();

        this.onTrigger = new MultiEventProducer();
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);

        makeAutoObservable<OutsideEventHandlerService, PrivateKeys>(this, {
            _key: false,
            _ref: false,
            onTrigger: false,
            _removeMouseDown: false,
            _removeMouseUp: false,
            hooks: false, // don't convert to a flow
        });
    }

    get key() {
        return this._key;
    }

    get enabled() {
        return this._enabled;
    }

    set enabled(value: boolean) {
        this._enabled = value;
    }

    get ref() {
        return this._ref;
    }

    isDescendant(element: Node | undefined | null) {
        if (!this.ref || !element) return false;
        return this.ref.current?.contains(element);
    }

    private _onMouseDown(e: Event) {
        if (this._removeMouseUp) {
            this._removeMouseUp();
            this._removeMouseUp = null;
        }

        if (!e.target) return;
        if (!this.ref.current) return;
        if (this.ref.current.contains(e.target as Node)) return;

        this._removeMouseUp = addEventListener(
            document,
            MOUSE_UP_EVENT,
            this._onMouseUp,
            { capture: true },
        );
    }

    private _onMouseUp(e: Event) {
        if (this._removeMouseUp) {
            this._removeMouseUp();
            this._removeMouseUp = null;
        }

        if (!e.target) return;
        if (!this.ref.current) return;
        if (this.ref.current.contains(e.target as Node)) return;

        this.onTrigger.produce(e);
    }

    private _addMouseDownEventListener() {
        this._removeMouseDown = addEventListener(
            document,
            MOUSE_DOWN_EVENT,
            this._onMouseDown,
            { capture: true },
        );
    }

    private _removeEventListeners() {
        if (this._removeMouseDown) this._removeMouseDown();
        if (this._removeMouseUp) this._removeMouseUp();
    }

    *hooks() {
        yield {
            name: "toggle-listeners",
            componentKey: this.key,
            call: this._toggleListenersOnRender.bind(this),
        };
    }

    private _toggleListenersOnRender() {
        useEffect(() => {
            if (this._enabled) {
                this._addMouseDownEventListener();
                return () => this._removeEventListeners();
            } else {
                this._removeEventListeners();
            }
        }, [this._enabled]);
    }
}
