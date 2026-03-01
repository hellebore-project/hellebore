import { DomainManager } from "@/services";
import type { IComponentService, OpenEntryEditorEvent } from "@/interface";
import { DIVIDER_DATA, type MenubarItemData } from "@/lib/components/menubar";
import { EventProducer, MultiEventProducer } from "@/utils/event-producer";

import { EntrySearchService } from "../shared/entry-search";

interface MenuItems {
    project: {
        create: MenubarItemData;
        open: MenubarItemData;
        close: MenubarItemData;
    };
    entry: {
        create: MenubarItemData;
    };
    settings: MenubarItemData;
}

export class HeaderManager implements IComponentService {
    // CONSTANTS
    readonly key = "header";
    readonly DEFAULT_HEIGHT = 50;

    // STATE
    private _menuItems: MenuItems;

    // SERVICES
    domain: DomainManager;
    entrySearch: EntrySearchService;

    // EVENTS
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
        this.domain = domain;
        this.entrySearch = new EntrySearchService(domain);

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
                    onSelect: () => this.onCreateProject.produce(),
                },
                open: {
                    label: "Open Project",
                    onSelect: () => this.onLoadProject.produce(),
                },
                close: {
                    label: "Close Project",
                    onSelect: () => this.onCloseProject.produce(),
                },
            },
            entry: {
                create: {
                    label: "New Entry",
                    onSelect: () => this.onCreateEntry.produce(),
                },
            },
            settings: {
                label: "Settings",
                onSelect: () => this.onOpenSettings.produce(),
            },
        };

        this._linkSubscribables();
    }

    get height() {
        return this.DEFAULT_HEIGHT;
    }

    get fileMenuData() {
        if (this.domain.hasProject)
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
        this.entrySearch.onOpenEntry.broker = this.onOpenEntry;
    }
}
