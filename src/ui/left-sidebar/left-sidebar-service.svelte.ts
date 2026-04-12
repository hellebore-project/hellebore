import { SvelteMap } from "svelte/reactivity";

import type {
    ChangeEntryEditorViewEvent,
    IComponentService,
    ISidebarSectionService,
    AddEntryEditorNavigatorEvent,
    ReleaseSidebarSectionEvent,
    Id,
    OpenEntryEditorEvent,
} from "@/interface";
import { DomainManager } from "@/services";
import { SidebarSectionType } from "@/constants";

import { EntryEditorNavigatorService, EntrySpotlightService } from "./sections";
import { EventProducer } from "@/utils/event-producer";

interface LeftSidebarServiceArgs {
    domain: DomainManager;
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

    // EVENTS
    onSelectEntryEditorNavItem: EventProducer<
        ChangeEntryEditorViewEvent,
        unknown
    >;
    onOpenEntry: EventProducer<OpenEntryEditorEvent, unknown>;

    constructor({ domain }: LeftSidebarServiceArgs) {
        this.domain = domain;
        this.onSelectEntryEditorNavItem = new EventProducer();
        this.onOpenEntry = new EventProducer();
    }

    get width() {
        return this.NAVBAR_WIDTH;
    }

    // SPOTLIGHT

    addSpotlight() {
        const existing = this.getSectionByType<EntrySpotlightService>(
            SidebarSectionType.Spotlight,
        );
        if (existing) return existing;

        const section = new EntrySpotlightService({
            domain: this.domain,
            folderNodeId: (id) => `folder-${id}`,
            rawFolderId: (nodeId) =>
                parseInt(nodeId.replace("folder-", ""), 10),
            entryNodeId: (id) => `entry-${id}`,
            createPlaceholderId: () => `placeholder-${Date.now()}`,
        });
        section.onOpenEntry.broker = this.onOpenEntry;
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

    updateEntryEditorNavigatorTitle(entryId: Id, title: string) {
        const section = this.getSectionByType<EntryEditorNavigatorService>(
            SidebarSectionType.EntryEditorNavigator,
        );
        if (!section || section.entryId !== entryId) return;
        section.title = title;
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
}
