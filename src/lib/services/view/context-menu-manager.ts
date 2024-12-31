import { makeAutoObservable, toJS } from "mobx";

import { ContextMenuKey, NodeId, Point } from "@/interface";
import { OutsideClickHandlerState } from "@/shared/outside-click-handler";

class ArticleNavigatorContextMenuService {
    _id: number | null = null;
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

    get nodeId() {
        return this._nodeId;
    }

    set nodeId(nodeId: NodeId | null) {
        this._nodeId = nodeId;
    }
}

export class ContextMenuService {
    _key: ContextMenuKey | null = null;
    _position: Point | null = null;
    _selectedIndex: number | null = null;
    _outsideClickHandlerState: OutsideClickHandlerState;

    articleNavigator: ArticleNavigatorContextMenuService;

    constructor() {
        makeAutoObservable(this, { articleNavigator: false });
        this.articleNavigator = new ArticleNavigatorContextMenuService();
        this._outsideClickHandlerState = new OutsideClickHandlerState({
            onOutsideClick: () => this.close(),
            disabled: false,
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

    get outsideClickHandlerState() {
        return this._outsideClickHandlerState;
    }

    openForNavBarFolderNode({
        position,
        id,
        nodeId,
    }: {
        position: Point;
        id: number;
        nodeId: NodeId;
    }) {
        this.key = ContextMenuKey.NAV_BAR_FOLDER_NODE;
        this.position = position;
        this.articleNavigator.id = id;
        this.articleNavigator.nodeId = nodeId;
    }

    close() {
        this.reset();
    }

    reset() {
        this.key = null;
        this.position = null;
        this.selectedIndex = null;
    }
}
