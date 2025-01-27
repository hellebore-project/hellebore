import { makeAutoObservable, toJS } from "mobx";

import {
    ContextMenuKey,
    NodeId,
    Point,
    VerticalMenuItemData,
} from "@/interface";
import { OutsideClickHandlerState } from "@/shared/outside-click-handler";
import { ViewManagerInterface } from "./interface";

type ContextMenuDataMapping = {
    [key in ContextMenuKey]: VerticalMenuItemData[];
};

class ArticleNavigatorContextMenuManager {
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

export class ContextMenuManager {
    _key: ContextMenuKey | null = null;
    _position: Point | null = null;
    _selectedIndex: number | null = null;
    _outsideClickHandlerState: OutsideClickHandlerState;

    menuData: ContextMenuDataMapping;

    view: ViewManagerInterface;
    articleNavigator: ArticleNavigatorContextMenuManager;

    constructor(view: ViewManagerInterface) {
        makeAutoObservable(this, {
            view: false,
            articleNavigator: false,
            menuData: false,
        });
        this.view = view;
        this.articleNavigator = new ArticleNavigatorContextMenuManager();
        this._outsideClickHandlerState = new OutsideClickHandlerState({
            onOutsideClick: () => this.close(),
            disabled: false,
        });
        this.menuData = this._generateMenuDataMapping();
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

    get outsideClickHandler() {
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

    openForNavBarArticleNode({
        position,
        id,
        nodeId,
    }: {
        position: Point;
        id: number;
        nodeId: NodeId;
    }) {
        this.key = ContextMenuKey.NAV_BAR_ARTICLE_NODE;
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

    _generateMenuDataMapping() {
        // folder node in the nav bar
        const NAV_BAR_FOLDER_NODE_DATA = this._formatMenuData([
            {
                label: "Rename",
                onConfirm: () => {
                    const id = this.articleNavigator.id as number;
                    return new Promise(() => this.view.editFolderName(id));
                },
            },
            {
                label: "Delete",
                onConfirm: () => {
                    const id = this.articleNavigator.id as number;
                    return new Promise(() => this.view.deleteFolder(id));
                },
            },
        ]);

        // article node in the nav bar
        const NAV_BAR_ARTICLE_NODE_DATA = this._formatMenuData([
            {
                label: "Delete",
                onConfirm: () => {
                    const id = this.articleNavigator.id as number;
                    return new Promise(() => this.view.deleteEntity(id));
                },
            },
        ]);

        return {
            [ContextMenuKey.NAV_BAR_FOLDER_NODE]: NAV_BAR_FOLDER_NODE_DATA,
            [ContextMenuKey.NAV_BAR_ARTICLE_NODE]: NAV_BAR_ARTICLE_NODE_DATA,
        };
    }

    _formatMenuData(data: Partial<VerticalMenuItemData>[]) {
        return data.map((d, i) => ({
            index: i,
            value: d.label,
            ...d,
        })) as VerticalMenuItemData[];
    }
}
