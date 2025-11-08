import { makeAutoObservable } from "mobx";

import { DomainManager } from "@/domain";
import { DIVIDER_DATA, MenuDropdownElementData } from "@/shared/menu-dropdown";
import { EventProducer } from "@/utils/event";

type PrivateKeys = "_menuItems" | "_domain";

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

    private _domain: DomainManager;

    onCreateProject: EventProducer<void, unknown>;
    onLoadProject: EventProducer<void, unknown>;
    onCloseProject: EventProducer<void, unknown>;
    onCreateEntry: EventProducer<void, unknown>;
    onOpenSettings: EventProducer<void, unknown>;

    constructor(domain: DomainManager) {
        this._domain = domain;

        this.onCreateProject = new EventProducer();
        this.onLoadProject = new EventProducer();
        this.onCloseProject = new EventProducer();
        this.onCreateEntry = new EventProducer();
        this.onOpenSettings = new EventProducer();

        this._menuItems = {
            project: {
                create: {
                    label: "New Project",
                    onClick: () => this.onCreateProject.produce(),
                },
                open: {
                    label: "Open Project",
                    onClick: () => this.onLoadProject.produce(),
                },
                close: {
                    label: "Close Project",
                    onClick: () => this.onCloseProject.produce(),
                },
            },
            entry: {
                create: {
                    label: "New Entry",
                    onClick: () => this.onCreateEntry.produce(),
                },
            },
            settings: {
                label: "Settings",
                onClick: () => this.onOpenSettings.produce(),
            },
        };

        makeAutoObservable<HeaderManager, PrivateKeys>(this, {
            _menuItems: false,
            _domain: false,
            onCreateProject: false,
            onLoadProject: false,
            onCloseProject: false,
            onCreateEntry: false,
            onOpenSettings: false,
        });
    }

    get height() {
        return this.DEFAULT_HEIGHT;
    }

    getFileMenuData() {
        if (this._domain.hasProject)
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
