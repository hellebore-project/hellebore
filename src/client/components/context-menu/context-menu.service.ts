import { makeAutoObservable, toJS } from "mobx";

import {
    DeleteEntryEvent,
    DeleteFolderEvent,
    EditFolderNameEvent,
    OpenFileContextMenuEvent,
} from "@/client/interface";
import { OutsideEventHandlerService } from "@/components/outside-event-handler";
import { IComponentService, Point } from "@/interface";
import { MultiEventProducer } from "@/utils/event-producer";

import {
    BaseContextMenuService,
    EntryFileContextMenuService,
    FolderContextMenuService,
} from "./model";

export class ContextMenuManager implements IComponentService {
    readonly key = "CONTEXT_MENU";
    readonly DEFAULT_POSITION: Point = { x: 0, y: 0 };

    private _visible = false;
    private _position: Point;
    private _selectedIndex: number | null = null;

    menu: BaseContextMenuService | null = null;

    outsideEvent: OutsideEventHandlerService;

    onEditFolderName: MultiEventProducer<EditFolderNameEvent, unknown>;
    onDeleteFolder: MultiEventProducer<DeleteFolderEvent, unknown>;
    onDeleteEntry: MultiEventProducer<DeleteEntryEvent, unknown>;

    constructor() {
        this._position = this.DEFAULT_POSITION;

        this.outsideEvent = new OutsideEventHandlerService({
            enabled: false,
        });
        this.outsideEvent.onTrigger.subscribe(() => this.close());

        this.onEditFolderName = new MultiEventProducer();
        this.onDeleteFolder = new MultiEventProducer();
        this.onDeleteEntry = new MultiEventProducer();

        makeAutoObservable(this, {
            menu: false,
            outsideEvent: false,
            onDeleteEntry: false,
            onEditFolderName: false,
            onDeleteFolder: false,
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

    set selectedIndex(index: number | null) {
        this._selectedIndex = index;
    }

    hook() {
        this.outsideEvent.hook();
    }

    openForNavBarFolderNode({ id, text, position }: OpenFileContextMenuEvent) {
        const menu = new FolderContextMenuService(id, text);
        menu.onRename.broker = this.onEditFolderName;
        menu.onDelete.broker = this.onDeleteFolder;
        this._open(menu, position);
    }

    openForNavBarEntryNode({ id, text, position }: OpenFileContextMenuEvent) {
        const menu = new EntryFileContextMenuService(id, text);
        menu.onDelete.broker = this.onDeleteEntry;
        this._open(menu, position);
    }

    private _open(menu: BaseContextMenuService, position: Point) {
        this._visible = true;
        this._position = position;
        this._selectedIndex = null;
        this.menu = menu;
        this.outsideEvent.enabled = true;
    }

    reset() {
        this._position = this.DEFAULT_POSITION;
        this._selectedIndex = null;
        this.menu = null;
    }

    close() {
        this._visible = false;
        this.outsideEvent.enabled = false;
        this.reset();
    }
}
