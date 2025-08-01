import { makeAutoObservable, toJS } from "mobx";

import {
    ContextMenuKey,
    NodeId,
    Point,
    VerticalSelectionData,
} from "@/interface";
import { OutsideEventHandlerService } from "@/shared/outside-event-handler";
import { ViewManagerInterface } from "./interface";

export interface OpenArguments {
    position: Point;
    id: number;
    nodeId: NodeId;
}

interface PrivateOpenArguments extends OpenArguments {
    key: ContextMenuKey;
}

type ContextMenuDataMapping = {
    [key in ContextMenuKey]: VerticalSelectionData[];
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
    private _key: ContextMenuKey | null = null;
    private _position: Point | null = null;
    private _selectedIndex: number | null = null;

    menuData: ContextMenuDataMapping;

    view: ViewManagerInterface;
    articleNavigator: ArticleNavigatorContextMenuManager;
    outsideEventHandler: OutsideEventHandlerService;

    constructor(view: ViewManagerInterface) {
        makeAutoObservable(this, {
            view: false,
            articleNavigator: false,
            menuData: false,
            outsideEventHandler: false,
        });
        this.view = view;
        this.articleNavigator = new ArticleNavigatorContextMenuManager();
        this.outsideEventHandler = new OutsideEventHandlerService({
            onOutsideEvent: () => this.close(),
            enabled: false,
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

    openForNavBarFolderNode(args: OpenArguments) {
        this._open({ key: ContextMenuKey.NavBarFolderNode, ...args });
    }

    openForNavBarArticleNode(args: OpenArguments) {
        this._open({ key: ContextMenuKey.NavBarArticleNode, ...args });
    }

    close() {
        this.outsideEventHandler.enabled = false;
        this.reset();
    }

    reset() {
        this.key = null;
        this.position = null;
        this.selectedIndex = null;
    }

    private _open({ key, position, id, nodeId }: PrivateOpenArguments) {
        this.key = key;
        this.position = position;
        this.articleNavigator.id = id;
        this.articleNavigator.nodeId = nodeId;
        this.outsideEventHandler.enabled = true;
    }

    private _generateMenuDataMapping() {
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
            [ContextMenuKey.NavBarFolderNode]: NAV_BAR_FOLDER_NODE_DATA,
            [ContextMenuKey.NavBarArticleNode]: NAV_BAR_ARTICLE_NODE_DATA,
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
