import { makeAutoObservable } from "mobx";

import {
    DIVIDER_DATA,
    MenuDropdownElementData,
} from "@/components/react/lib/menu-dropdown";
import { DomainManager } from "@/services";
import { IComponentService, OpenEntryEditorEvent } from "@/interface";
import { EventProducer, MultiEventProducer } from "@/model";

import { EntrySearchService } from "../shared/entry-search-field";

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

export class HeaderManager implements IComponentService {
    // CONSTANTS
    readonly key = "header";
    readonly DEFAULT_HEIGHT = 50;

    // STATE
    private _menuItems: MenuItems;

    // SERVICES
    private _domain: DomainManager;
    entrySearch: EntrySearchService;

    // EVENTS
    fetchPortalSelector: EventProducer<void, string>;
    onCreateProject: MultiEventProducer<void, unknown>;
    onLoadProject: MultiEventProducer<void, unknown>;
    onCloseProject: MultiEventProducer<void, unknown>;
    onOpenHome: MultiEventProducer<void, unknown>;
    onOpenSettings: MultiEventProducer<void, unknown>;
    onCreateEntry: MultiEventProducer<void, unknown>;
    onOpenEntry: MultiEventProducer<OpenEntryEditorEvent, unknown>;
    fetchLeftBarStatus: EventProducer<void, boolean>;
    onToggleLeftBar: MultiEventProducer<void, unknown>;

    constructor(domain: DomainManager) {
        this._domain = domain;
        this.entrySearch = new EntrySearchService(domain);

        this.fetchPortalSelector = new EventProducer();
        this.onCreateProject = new MultiEventProducer();
        this.onLoadProject = new MultiEventProducer();
        this.onCloseProject = new MultiEventProducer();
        this.onOpenHome = new MultiEventProducer();
        this.onOpenSettings = new MultiEventProducer();
        this.onCreateEntry = new MultiEventProducer();
        this.onOpenEntry = new MultiEventProducer();
        this.fetchLeftBarStatus = new EventProducer();
        this.onToggleLeftBar = new MultiEventProducer();

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
            fetchPortalSelector: false,
            onCreateProject: false,
            onLoadProject: false,
            onCloseProject: false,
            onOpenHome: false,
            onOpenSettings: false,
            onCreateEntry: false,
            onOpenEntry: false,
            fetchLeftBarStatus: false,
            onToggleLeftBar: false,
        });

        this._linkSubscribables();
    }

    get height() {
        return this.DEFAULT_HEIGHT;
    }

    get fileMenuData() {
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

    private _linkSubscribables() {
        this.entrySearch.fetchPortalSelector.broker = this.fetchPortalSelector;
        this.entrySearch.onOpenEntry.broker = this.onOpenEntry;
    }
}
