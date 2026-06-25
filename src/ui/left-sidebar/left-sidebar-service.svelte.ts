import { SvelteMap } from "svelte/reactivity";

import { SidebarSectionType } from "@/constants";
import type {
    ChangeEntryEditorViewEvent,
    DeleteEntryEvent,
    DeleteFolderEvent,
    FolderCreationEvent,
    IComponentService,
    ISidebarSectionService,
    AddEntryEditorNavigatorEvent,
    MoveFolderEvent,
    MoveFolderResult,
    PollEvent,
    PollResult,
    ReleaseSidebarSectionEvent,
    Id,
    OpenEntryEditorEvent,
    SyncEvent,
    DataChangeEvent,
} from "@/interface";
import type {
    DomainManager,
    BulkEntryResponse,
    EntryInfoResponse,
    FolderResponse,
} from "@/api";
import { ClientData } from "@/models";
import { EventProducer } from "@/utils/event-producer";

import { EntryEditorNavigatorService, EntrySpotlightService } from "./sections";

interface LeftSidebarServiceArgs {
    domain: DomainManager;
    data: ClientData;
}

export class LeftSidebarService implements IComponentService {
    // CONSTANTS
    readonly id = "left-side-bar";
    readonly NAVBAR_WIDTH = 300;

    // STATE VARIABLES
    private _sectionIds: string[] = $state([]);
    private _sections = new SvelteMap<string, ISidebarSectionService>();

    // SERVICES
    domain: DomainManager;
    data: ClientData;

    // EVENTS
    onSelectEntryEditorNavItem: EventProducer<
        ChangeEntryEditorViewEvent,
        unknown
    >;
    onOpenEntry: EventProducer<OpenEntryEditorEvent, unknown>;
    onCreateFolder: EventProducer<
        FolderCreationEvent,
        Promise<FolderResponse | null>
    >;
    onMoveFolder: EventProducer<MoveFolderEvent, Promise<MoveFolderResult>>;
    onDeleteFolder: EventProducer<
        DeleteFolderEvent,
        Promise<BulkEntryResponse | null>
    >;
    onDeleteEntry: EventProducer<DeleteEntryEvent, Promise<boolean>>;
    onDataChange: EventProducer<DataChangeEvent, unknown>;

    constructor({ domain, data }: LeftSidebarServiceArgs) {
        this.domain = domain;
        this.data = data;
        this.onSelectEntryEditorNavItem = new EventProducer();
        this.onOpenEntry = new EventProducer();
        this.onCreateFolder = new EventProducer();
        this.onMoveFolder = new EventProducer();
        this.onDeleteFolder = new EventProducer();
        this.onDeleteEntry = new EventProducer();
        this.onDataChange = new EventProducer();
    }

    get width() {
        return this.NAVBAR_WIDTH;
    }

    // SPOTLIGHT

    addSpotlight(ownerId: string) {
        const existing = this.getSectionByType<EntrySpotlightService>(
            SidebarSectionType.EntrySpotlight,
        );
        if (existing) return existing;

        const section = new EntrySpotlightService(this.domain, this.data);
        section.ownership.add(ownerId);

        section.onOpenEntry.broker = this.onOpenEntry;
        section.onCreateFolder.broker = this.onCreateFolder;
        section.onMoveFolder.broker = this.onMoveFolder;
        section.onDeleteFolder.broker = this.onDeleteFolder;
        section.onDeleteEntry.broker = this.onDeleteEntry;
        section.onChangeEntry.subscribe((event) =>
            this.onDataChange.produce({ entries: [event] }),
        );
        section.onChangeFolder.subscribe((event) =>
            this.onDataChange.produce({ folders: [event] }),
        );

        this._addSection(section);

        return section;
    }

    // ENTRY EDITOR NAVIGATOR

    addEntryEditorNavigator(event: AddEntryEditorNavigatorEvent) {
        const existingSection =
            this.getSectionByType<EntryEditorNavigatorService>(
                SidebarSectionType.EntryEditorNavigator,
            );

        if (existingSection) {
            existingSection.load(event);
            return existingSection;
        } else {
            const newSection = new EntryEditorNavigatorService(event);
            newSection.onSelectItem.broker = this.onSelectEntryEditorNavItem;
            this._addSection(newSection);
            return newSection;
        }
    }

    // ACCESSING SECTIONS

    getSectionByType<T extends ISidebarSectionService>(
        type: SidebarSectionType,
    ): T | null {
        return (this._sections.get(type) ?? null) as T | null;
    }

    *iterateSections() {
        for (const key of this._sectionIds)
            yield this._sections.get(key) as ISidebarSectionService;
    }

    // ADDING SECTIONS

    private _addSection(section: ISidebarSectionService): boolean {
        if (this._sections.has(section.id)) {
            return false;
        }

        this._sections.set(section.id, section);
        this._sectionIds.push(section.id);
        section.activate();

        return true;
    }

    // RELEASING SECTIONS

    releaseSection({ ownerId, type }: ReleaseSidebarSectionEvent) {
        const section = this._sections.get(type);
        if (!section) return false;

        section.ownership.remove(ownerId);
        if (section.ownership.isOwned) return false;

        this._removeSection(section);

        return true;
    }

    // REMOVING SECTIONS

    removeSection(type: SidebarSectionType) {
        // callers won't know the ID of the section, so they'll have to rely on the type;
        // for now, section's are basically singletons, meaning that we can treat the ID and the type interchangeably
        this._removeSectionById(type);
    }

    private _removeSectionById(id: string): boolean {
        const section = this._sections.get(id);
        if (!section) return false;
        return this._removeSection(section);
    }

    private _removeSection(section: ISidebarSectionService): boolean {
        section.cleanUp();
        this._sections.delete(section.id);
        const index = this._sectionIds.indexOf(section.id);
        if (index >= 0) this._sectionIds.splice(index, 1);
        return true;
    }

    // EVENT HANDLERS

    updateEntryDisplayedStatus(id: Id, displayed: boolean) {
        const section = this.getSectionByType<EntrySpotlightService>(
            SidebarSectionType.EntrySpotlight,
        );
        if (!section) return;

        if (displayed) section.setDisplayedEntry(id);
        else section.setDisplayedEntry(null);
    }

    updateDisplayedEntryTitle(entryId: Id, title: string) {
        const spotlight = this.getSectionByType<EntrySpotlightService>(
            SidebarSectionType.EntrySpotlight,
        );
        spotlight?.updateEntryText(entryId, title);

        const navigator = this.getSectionByType<EntryEditorNavigatorService>(
            SidebarSectionType.EntryEditorNavigator,
        );
        if (!navigator || navigator.entryId !== entryId) return;
        navigator.title = title;
    }

    addEntryNode(entry: EntryInfoResponse) {
        const section = this.getSectionByType<EntrySpotlightService>(
            SidebarSectionType.EntrySpotlight,
        );
        section?.addEntryNode(entry);
    }

    deleteFolderNode(id: Id) {
        const section = this.getSectionByType<EntrySpotlightService>(
            SidebarSectionType.EntrySpotlight,
        );
        section?.deleteFolderNode(id);
    }

    deleteEntryNode(id: Id) {
        const section = this.getSectionByType<EntrySpotlightService>(
            SidebarSectionType.EntrySpotlight,
        );
        section?.deleteEntryNode(id);
    }

    fetchChanges(event: PollEvent): PollResult {
        const spotlight = this.getSectionByType<EntrySpotlightService>(
            SidebarSectionType.EntrySpotlight,
        );
        return spotlight?.fetchChanges(event) ?? { entries: [], folders: [] };
    }

    handleSynchronization(event: SyncEvent) {
        const spotlight = this.getSectionByType<EntrySpotlightService>(
            SidebarSectionType.EntrySpotlight,
        );
        spotlight?.handleSynchronization({
            folders: event.folders ?? [],
            entries: event.entries ?? [],
        });
    }
}
