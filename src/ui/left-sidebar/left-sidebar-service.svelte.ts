import { SvelteMap } from "svelte/reactivity";

import type {
    ChangeEntryEditorViewEvent,
    IComponentService,
    ISidebarSectionService,
    AddEntryEditorNavigatorEvent,
    ReleaseSidebarSectionEvent,
    Id,
} from "@/interface";
import { DomainManager } from "@/services";
import { SidebarSectionType } from "@/constants";

import { EntryEditorNavigatorService } from "./sections";
import { EventProducer } from "@/utils/event-producer";

interface LeftSidebarServiceArgs {
    domain: DomainManager;
}

export class LeftSidebarService implements IComponentService {
    // CONSTANTS
    readonly key = "left-side-bar";
    readonly NAVBAR_WIDTH = 300;

    // STATE VARIABLES
    private _sectionKeys: string[] = $state([]);
    private _sections = new SvelteMap<string, ISidebarSectionService>();

    // SERVICES
    domain: DomainManager;

    // EVENTS
    onSelectEntryEditorNavItem: EventProducer<
        ChangeEntryEditorViewEvent,
        unknown
    >;

    constructor({ domain }: LeftSidebarServiceArgs) {
        this.domain = domain;
        this.onSelectEntryEditorNavItem = new EventProducer();
    }

    get width() {
        return this.NAVBAR_WIDTH;
    }

    // SPOTLIGHT

    addSpotlight() {
        // TODO
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
        for (const key of this._sectionKeys)
            yield this._sections.get(key) as ISidebarSectionService;
    }

    // ADDING SECTIONS

    private _addSection(section: ISidebarSectionService): boolean {
        if (this._sections.has(section.key)) {
            return false;
        }

        this._sections.set(section.key, section);
        this._sectionKeys.push(section.key);
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
        // callers won't know the key of the section, so they'll have to rely on the type;
        // for now, section's are basically singletons, meaning that we can treat the key and the type interchangeably
        this._removeSectionByKey(type);
    }

    private _removeSectionByKey(key: string): boolean {
        const section = this._sections.get(key);
        if (!section) return false;
        return this._removeSection(section);
    }

    private _removeSection(section: ISidebarSectionService): boolean {
        section.cleanUp();
        this._sections.delete(section.key);
        const index = this._sectionKeys.indexOf(section.key);
        if (index >= 0) this._sectionKeys.splice(index, 1);
        return true;
    }
}
