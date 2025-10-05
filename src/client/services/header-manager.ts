import { makeAutoObservable } from "mobx";

import { IClientManager } from "@/client/interface";
import { DIVIDER_DATA, MenuDropdownElementData } from "@/shared/menu-dropdown";

type PrivateKeys = "_menuItems" | "_client";

interface MenuItems {
    project: {
        create: MenuDropdownElementData;
        open: MenuDropdownElementData;
        close: MenuDropdownElementData;
    };
    entry: {
        create: MenuDropdownElementData;
    };
    settings: MenuDropdownElementData;
}

export class HeaderManager {
    readonly DEFAULT_HEIGHT = 30;

    private _menuItems: MenuItems;

    private _client: IClientManager;

    constructor(client: IClientManager) {
        this._client = client;
        this._menuItems = {
            project: {
                create: {
                    label: "New Project",
                    onClick: () => this._client.openProjectCreator(),
                },
                open: {
                    label: "Open Project",
                    onClick: () => this._client.loadProject(),
                },
                close: {
                    label: "Close Project",
                    onClick: () => this._client.closeProject(),
                },
            },
            entry: {
                create: {
                    label: "New Entry",
                    onClick: () => this._client.openEntryCreator(),
                },
            },
            settings: {
                label: "Settings",
                onClick: () => this._client.openSettings(),
            },
        };

        makeAutoObservable<HeaderManager, PrivateKeys>(this, {
            _menuItems: false,
            _client: false,
        });
    }

    get height() {
        return this.DEFAULT_HEIGHT;
    }

    getFileMenuData() {
        if (this._client.domain.hasProject)
            return [
                this._menuItems.project.create,
                this._menuItems.project.open,
                this._menuItems.project.close,
                DIVIDER_DATA,
                this._menuItems.entry.create,
                DIVIDER_DATA,
                this._menuItems.settings,
            ];
        return [
            this._menuItems.project.create,
            this._menuItems.project.open,
            DIVIDER_DATA,
            this._menuItems.settings,
        ];
    }
}
