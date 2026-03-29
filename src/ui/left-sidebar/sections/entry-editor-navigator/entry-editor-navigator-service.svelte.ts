import { EntryType, EntryViewType, SidebarSectionType } from "@/constants";
import type {
    ChangeEntryEditorViewEvent,
    Id,
    ISidebarSectionService,
} from "@/interface";
import { EventProducer } from "@/utils/event-producer";
import { SoleOwnership, type BaseOwnership } from "@/utils/ownership";

export interface EntryEditorNavigatorItem {
    label: string;
    value: EntryViewType;
}

interface EntryEditorNavigatorServiceArgs {
    ownerId: string;
    entryId: Id;
    entryType?: EntryType | null;
    activeView?: EntryViewType;
}

export class EntryEditorNavigatorService implements ISidebarSectionService {
    // CONSTANTS
    readonly type = SidebarSectionType.EntryEditorNavigator;
    readonly title = "Views";

    // STATE VARIABLES
    entryId: Id = $state(-1); // default to an invalid sentinel value
    entryType: EntryType | null = $state(null);
    activeView: EntryViewType = $state(EntryViewType.ArticleEditor);
    collapsed = $state(false);
    ownership: BaseOwnership;

    // EVENTS
    onSelectItem: EventProducer<ChangeEntryEditorViewEvent, unknown>;

    constructor(args: EntryEditorNavigatorServiceArgs) {
        this.ownership = new SoleOwnership();
        this.onSelectItem = new EventProducer();

        this.load(args);
    }

    get key() {
        return this.type;
    }

    get menuItems(): EntryEditorNavigatorItem[] {
        // if the entry type is null, then we only return the views that all entry types have in common
        const items: EntryEditorNavigatorItem[] = [
            { label: "Article", value: EntryViewType.ArticleEditor },
            { label: "Properties", value: EntryViewType.PropertyEditor },
        ];
        if (this.entryType === EntryType.Language) {
            items.push({ label: "Lexicon", value: EntryViewType.WordEditor });
        }
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
        entryId,
        entryType = null,
        activeView = EntryViewType.ArticleEditor,
    }: EntryEditorNavigatorServiceArgs) {
        this.ownership.add(ownerId);
        this.entryId = entryId;
        this.entryType = entryType;
        this.activeView = activeView;

        if (this.entryType === null)
            console.warn(`${this.key} service received a null entry type`);
    }

    activate() {
        return;
    }

    cleanUp() {
        this.onSelectItem.clear();
    }
}
