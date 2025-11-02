import { makeAutoObservable, toJS } from "mobx";

import { Point } from "@/interface";
import { ContextMenuKey } from "@/client/constants";
import { IClientManager, NodeId } from "@/client/interface";
import { OutsideEventHandlerService } from "@/shared/outside-event-handler";
import { VerticalSelectionData } from "@/shared/vertical-selection";

type PrivateKeys = "_client";

export interface OpenArguments {
    position: Point;
    id: number;
    text: string;
}

interface PrivateOpenArguments extends OpenArguments {
    key: ContextMenuKey;
}

type ContextMenuDataMapping = Record<ContextMenuKey, VerticalSelectionData[]>;

class FileNavigatorContextMenuManager {
    _id: number | null = null;
    _text: string | null = null;
    _nodeId: NodeId | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    get id() {
        return this._id;
    }

    set id(id: number | null) {
        this._id = id;
    }

    get text() {
        return this._text;
    }

    set text(text: string | null) {
        this._text = text;
    }
}

export class ContextMenuManager {
    private _key: ContextMenuKey | null = null;
    private _position: Point | null = null;
    private _selectedIndex: number | null = null;

    menuData: ContextMenuDataMapping;

    private _client: IClientManager;
    fileNavigator: FileNavigatorContextMenuManager;
    outsideEvent: OutsideEventHandlerService;

    constructor(client: IClientManager) {
        this._client = client;
        this.fileNavigator = new FileNavigatorContextMenuManager();
        this.outsideEvent = new OutsideEventHandlerService({
            enabled: false,
            onOutsideEvent: () => this.close(),
        });
        this.menuData = this._generateMenuDataMapping();

        makeAutoObservable<ContextMenuManager, PrivateKeys>(this, {
            _client: false,
            fileNavigator: false,
            menuData: false,
            outsideEvent: false,
        });
    }

    get key() {
        return this._key;
    }

    set key(key: ContextMenuKey | null) {
        this._key = key;
    }

    get position() {
        return toJS(this._position);
    }

    set position(pos: Point | null) {
        this._position = pos;
    }

    get selectedIndex() {
        return this._selectedIndex;
    }

    set selectedIndex(index: number | null) {
        this._selectedIndex = index;
    }

    openForNavBarFolderNode(args: OpenArguments) {
        this._open({ key: ContextMenuKey.NavBarFolderNode, ...args });
    }

    openForNavBarEntityNode(args: OpenArguments) {
        this._open({ key: ContextMenuKey.NavBarEntityNode, ...args });
    }

    close() {
        this.outsideEvent.enabled = false;
        this.reset();
    }

    reset() {
        this.key = null;
        this.position = null;
        this.selectedIndex = null;
    }

    hook() {
        this.outsideEvent.hook();
    }

    private _open({ key, position, id, text }: PrivateOpenArguments) {
        this.key = key;
        this.position = position;
        this.fileNavigator.id = id;
        this.fileNavigator.text = text;
        this.outsideEvent.enabled = true;
    }

    private _generateMenuDataMapping() {
        const NAV_BAR_FOLDER_NODE_DATA = this._formatMenuData([
            {
                label: "Rename",
                onConfirm: () => {
                    const id = this.fileNavigator.id as number;
                    return new Promise(() => this._client.editFolderName(id));
                },
            },
            {
                label: "Delete",
                onConfirm: () => {
                    const id = this.fileNavigator.id as number;
                    return new Promise(() => this._client.deleteFolder(id));
                },
            },
        ]);

        const NAV_BAR_ENTITY_NODE_DATA = this._formatMenuData([
            {
                label: "Delete",
                onConfirm: () => {
                    const id = this.fileNavigator.id as number;
                    const text = this.fileNavigator.text as string;
                    return new Promise(() =>
                        this._client.deleteEntry(id, text),
                    );
                },
            },
        ]);

        return {
            [ContextMenuKey.NavBarFolderNode]: NAV_BAR_FOLDER_NODE_DATA,
            [ContextMenuKey.NavBarEntityNode]: NAV_BAR_ENTITY_NODE_DATA,
        };
    }

    _formatMenuData(data: Partial<VerticalSelectionData>[]) {
        return data.map((d, i) => ({
            index: i,
            value: d.label,
            ...d,
        })) as VerticalSelectionData[];
    }
}
