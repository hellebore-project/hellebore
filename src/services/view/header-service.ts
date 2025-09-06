import { makeAutoObservable } from "mobx";

import { IViewManager } from "@/services/interface";
import { DIVIDER_DATA, MenuDropdownElementData } from "@/shared/menu-dropdown";

type PrivateKeys = "_menuItems";

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

export class HeaderService {
    private _menuItems: MenuItems;

    view: IViewManager;

    constructor(view: IViewManager) {
        makeAutoObservable<HeaderService, PrivateKeys>(this, {
            _menuItems: false,
            view: false,
        });
        this.view = view;
        this._menuItems = {
            project: {
                create: {
                    label: "New Project",
                    onClick: () => this.view.openProjectCreator(),
                },
                open: {
                    label: "Open Project",
                    onClick: () => this.view.loadProject(),
                },
                close: {
                    label: "Close Project",
                    onClick: () => this.view.closeProject(),
                },
            },
            entry: {
                create: {
                    label: "New Entry",
                    onClick: () => this.view.openEntityCreator(),
                },
            },
            settings: {
                label: "Settings",
                onClick: () => this.view.openSettings(),
            },
        };
    }

    getFileMenuData() {
        if (this.view.domain.hasProject)
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
