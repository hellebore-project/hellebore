import {
    ENTRY_VIEW_LABELS,
    EntryType,
    EntryViewType,
    SidebarSectionType,
} from "@/constants";
import type {
    ChangeEntryEditorViewEvent,
    Id,
    ISidebarSectionService,
} from "@/interface";
import { EventProducer } from "@/utils/event-producer";
import { SoleOwnership, type BaseOwnership } from "@/utils/ownership";

import type {
    EntryEditorNavigatorItem,
    EntryEditorNavigatorServiceArgs,
} from "./entry-editor-nav-interface";

const MENU_ITEMS = Object.fromEntries(
    Object.entries(ENTRY_VIEW_LABELS).map(([type, label]) => [
        type as EntryViewType,
        { label, value: type as EntryViewType },
    ]),
) as Record<EntryViewType, EntryEditorNavigatorItem>;

export class EntryEditorNavigatorService implements ISidebarSectionService {
    // CONSTANTS
    readonly type = SidebarSectionType.EntryEditorNavigator;

    // STATE VARIABLES
    entryId: Id = $state(-1); // default to an invalid sentinel value
    entryType: EntryType | null = $state(null);
    title: string = $state("Entry");
    activeView: EntryViewType = $state(EntryViewType.ArticleEditor);
    open = $state(true); // TODO: need to find a way to remember the open state after the entry-editor closes
    ownership: BaseOwnership;

    // EVENTS
    onSelectItem: EventProducer<ChangeEntryEditorViewEvent, unknown>;

    constructor(args: EntryEditorNavigatorServiceArgs) {
        this.ownership = new SoleOwnership();
        this.onSelectItem = new EventProducer();

        this.load(args);
    }

    get id() {
        return this.type;
    }

    get menuItems(): EntryEditorNavigatorItem[] {
        // if the entry type is null, then we only return the views that all entry types have in common
        const items: EntryEditorNavigatorItem[] = [
            MENU_ITEMS[EntryViewType.ArticleEditor],
            MENU_ITEMS[EntryViewType.PropertyEditor],
        ];

        if (this.entryType === EntryType.Language)
            items.push(MENU_ITEMS[EntryViewType.WordEditor]);

        return items;
    }

    selectView(view: EntryViewType) {
        this.activeView = view;

        const soleOwnership = this.ownership as SoleOwnership;
        this.onSelectItem.produce({
            panelId: soleOwnership.ownerId as string,
            type: view,
        });
    }

    load({
        ownerId,
        entry,
        activeView = EntryViewType.ArticleEditor,
    }: EntryEditorNavigatorServiceArgs) {
        this.ownership.add(ownerId);
        this.entryId = entry.id;
        this.entryType = entry.type ?? null;
        this.title = entry.title ?? "Entry";
        this.activeView = activeView;

        if (this.entryType === null)
            console.warn(`${this.id} service received a null entry type`);
    }

    activate() {
        return;
    }

    cleanUp() {
        this.onSelectItem.clear();
    }
}
