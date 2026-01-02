import { ComboboxItem } from "@mantine/core";
import { makeAutoObservable } from "mobx";

import { DomainManager } from "@/domain";
import { DIVIDER_DATA, MenuDropdownElementData } from "@/shared/menu-dropdown";
import { EventProducer } from "@/utils/event";

import { OpenEntryEditorEvent } from "../interface";

type PrivateKeys =
    | "_waitingForQuery"
    | "_lastQueryRequestTime"
    | "_menuItems"
    | "_domain";

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
    // CONSTANTS
    readonly DEFAULT_HEIGHT = 50;
    readonly DEFAULT_QUERY_PERIOD = 500;

    // CONFIG
    /** Minimum amount of time to wait between queries to the backend in milliseconds */
    queryPeriod: number;

    // STATE
    private _searchQuery = "";
    private _searchData: ComboboxItem[];
    private _waitingForQuery = false;
    private _lastQueryRequestTime = 0;
    private _menuItems: MenuItems;

    // SERVICES
    private _domain: DomainManager;

    // EVENTS
    fetchPortalSelector: EventProducer<void, string>;
    onCreateProject: EventProducer<void, unknown>;
    onLoadProject: EventProducer<void, unknown>;
    onCloseProject: EventProducer<void, unknown>;
    onOpenHome: EventProducer<void, unknown>;
    onOpenSettings: EventProducer<void, unknown>;
    onCreateEntry: EventProducer<void, unknown>;
    onOpenEntry: EventProducer<OpenEntryEditorEvent, unknown>;
    fetchLeftBarStatus: EventProducer<void, boolean>;
    onToggleLeftBar: EventProducer<void, unknown>;

    constructor(domain: DomainManager) {
        this.queryPeriod = this.DEFAULT_QUERY_PERIOD;

        this._searchData = [];

        this._domain = domain;

        this.fetchPortalSelector = new EventProducer();
        this.onCreateProject = new EventProducer();
        this.onLoadProject = new EventProducer();
        this.onCloseProject = new EventProducer();
        this.onOpenHome = new EventProducer();
        this.onOpenSettings = new EventProducer();
        this.onCreateEntry = new EventProducer();
        this.onOpenEntry = new EventProducer();
        this.fetchLeftBarStatus = new EventProducer();
        this.onToggleLeftBar = new EventProducer();

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
            queryPeriod: false,
            _waitingForQuery: false,
            _lastQueryRequestTime: false,
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
    }

    get height() {
        return this.DEFAULT_HEIGHT;
    }

    get searchQuery() {
        return this._searchQuery;
    }

    set searchQuery(value: string) {
        this._searchQuery = value;
        this._requestEntryQuery();
    }

    get searchData() {
        return this._searchData;
    }

    set searchData(value: ComboboxItem[]) {
        this._searchData = value;
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

    selectEntrySearchResult(value: string | null) {
        if (value === null || value === "") return;
        this.onOpenEntry.produce({ id: Number(value), focus: true });
        this.cleanUp();
    }

    private async _requestEntryQuery() {
        this._lastQueryRequestTime = Date.now();

        if (this._waitingForQuery) return;
        this._waitingForQuery = true;

        while (true) {
            await new Promise((r) => setTimeout(r, this.queryPeriod));
            if (Date.now() - this._lastQueryRequestTime < this.queryPeriod)
                continue;
            break;
        }

        return this._queryEntries(this._searchQuery)
            .then((data) => (this.searchData = data))
            .finally(() => (this._waitingForQuery = false));
    }

    private async _queryEntries(keyword: string): Promise<ComboboxItem[]> {
        if (keyword === "") return [];

        const entries = await this._domain.entries.search({
            keyword: this._searchQuery,
            limit: 10,
        });
        if (entries)
            return entries.map((entry) => ({
                label: entry.title,
                value: entry.id.toString(),
            }));

        return [];
    }

    cleanUp() {
        this._searchQuery = "";
        this._searchData = [];
    }
}
