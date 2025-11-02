import { makeObservable, toJS } from "mobx";

import { Id, Point } from "@/interface";
import { IClientManager } from "@/client/interface";
import { OutsideEventHandlerService } from "@/shared/outside-event-handler";

import { BaseContextMenu } from "./context-menu.model";
import {
    EntryFileContextMenu,
    FolderContextMenu,
} from "./file-context-menu.model";

type PrivateKeys = "_client";

export interface OpenArguments {
    position: Point;
}

export class ContextMenuManager {
    readonly DEFAULT_POSITION: Point = { x: 0, y: 0 };

    private _visible = false;
    private _position: Point;
    private _selectedIndex = 0;

    menu: BaseContextMenu | null = null;

    protected _client: IClientManager;
    outsideEvent: OutsideEventHandlerService;

    constructor(client: IClientManager) {
        this._position = this.DEFAULT_POSITION;

        this._client = client;
        this.outsideEvent = new OutsideEventHandlerService({
            onOutsideEvent: () => this.close(),
            enabled: false,
        });

        makeObservable<ContextMenuManager, PrivateKeys>(this, {
            _client: false,
            menu: false,
            outsideEvent: false,
        });
    }

    get visible() {
        return this._visible;
    }

    get position() {
        return toJS(this._position);
    }

    set position(pos: Point) {
        this._position = pos;
    }

    get selectedIndex() {
        return this._selectedIndex;
    }

    set selectedIndex(index: number) {
        this._selectedIndex = index;
    }

    openForNavBarFolderNode(id: Id, text: string, position: Point) {
        this.menu = new FolderContextMenu(id, text, this._client);
        this._open(position);
    }

    openForNavBarEntryNode(id: Id, text: string, position: Point) {
        this.menu = new EntryFileContextMenu(id, text, this._client);
        this._open(position);
    }

    private _open(position: Point) {
        this._visible = true;
        this._position = position;
        this._selectedIndex = 0;
        this.outsideEvent.enabled = true;
    }

    reset() {
        this._position = this.DEFAULT_POSITION;
        this._selectedIndex = 0;
        this.menu = null;
    }

    close() {
        this._visible = false;
        this.outsideEvent.enabled = false;
        this.reset();
    }
}
