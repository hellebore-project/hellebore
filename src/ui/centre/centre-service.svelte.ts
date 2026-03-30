import { SvelteMap } from "svelte/reactivity";

import { CentralViewType, EntryViewType, ViewAction } from "@/constants";
import type {
    ChangeCentralPanelEvent,
    ChangeEntryEvent,
    DeleteEntryEvent,
    ICentralPanelContentService,
    IComponentService,
    OpenEntryEditorEvent,
    PollEvent,
    PollResultEntryData,
    SyncEvent,
} from "@/interface";
import { DomainManager } from "@/services";
import { EventProducer, MultiEventProducer } from "@/utils/event-producer";

import { HomeManager } from "./home";
import { SettingsEditorService } from "./settings-editor";
import {
    EntryEditorService,
    // type WordColumnKeys,
} from "./entry-editor";

export class CentralPanelManager implements IComponentService {
    // CONSTANTS
    readonly id = "central-panel";

    // STATE VARIABLES
    private _activePanelIndex: number | null = $state(null);
    private _panelIds: string[] = $state([]);
    private _panelServices: Map<string, ICentralPanelContentService>;

    // SERVICES
    private _domain: DomainManager;

    // EVENTS
    fetchPortalSelector: EventProducer<void, string>;
    onChangePanel: MultiEventProducer<ChangeCentralPanelEvent, unknown>;
    onChangeData: MultiEventProducer<ChangeEntryEvent, unknown>;
    onPartialChangeData: MultiEventProducer<ChangeEntryEvent, unknown>;
    onPeriodicChangeData: MultiEventProducer<ChangeEntryEvent, unknown>;
    onDeleteEntry: MultiEventProducer<DeleteEntryEvent, unknown>;

    constructor(domain: DomainManager) {
        this._panelIds = [];
        this._panelServices = new SvelteMap();

        this._domain = domain;

        this.fetchPortalSelector = new EventProducer();
        this.onChangePanel = new MultiEventProducer();
        this.onChangeData = new MultiEventProducer();
        this.onPartialChangeData = new MultiEventProducer();
        this.onPeriodicChangeData = new MultiEventProducer();
        this.onDeleteEntry = new MultiEventProducer();
    }

    // PROPERTIES

    get panelCount() {
        return this._panelIds.length;
    }

    get activePanelService() {
        if (this._activePanelIndex === null) return null;
        return this.getPanelByIndex(this._activePanelIndex);
    }

    get panelContainer() {
        return document.querySelector<HTMLDivElement>(".central-panel");
    }

    // OPENING PANELS

    openHome() {
        const currentIndex = this.findPanelIndex(CentralViewType.Home);
        if (currentIndex !== null) {
            this._showPanel(currentIndex);
            return this.getPanelByIndex(currentIndex) as HomeManager;
        }

        const service = new HomeManager(this._domain);

        service.load(this._domain.projectName ?? "");

        // only one panel can be open at a time
        this._clearAndAddPanel(service, true);

        return service;
    }

    openSettings() {
        const currentIndex = this.findPanelIndex(CentralViewType.Settings);
        if (currentIndex !== null) {
            this._showPanel(currentIndex);
            return this.getPanelByIndex(currentIndex) as SettingsEditorService;
        }

        const service = new SettingsEditorService();

        // only one panel can be open at a time
        this._clearAndAddPanel(service, true);

        return service;
    }

    async openEntryEditor(args: OpenEntryEditorEvent) {
        if (args.focus ?? false) this.panelContainer?.focus();

        const key = EntryEditorService.generateKey(
            CentralViewType.EntryEditor,
            args.id,
        );

        const currentIndex = this.findPanelIndex(key);
        if (currentIndex !== null) {
            this._showPanel(currentIndex);
            return this.getPanelByIndex(currentIndex) as EntryEditorService;
        }

        const service = new EntryEditorService(args.id, this._domain);

        service.onOpenReferencedEntry.subscribe((args) =>
            this.openEntryEditor(args),
        );
        service.onChange.broker = this.onChangeData;
        service.onPartialChange.broker = this.onPartialChangeData;
        service.onPeriodicChange.broker = this.onPeriodicChangeData;
        service.onDelete.broker = this.onDeleteEntry;

        // NOTE: the entry-editor service needs to finish loading before we can proceed with
        // firing the event producers.
        await service.load(args);

        // only one panel can be open at a time
        this._clearAndAddPanel(service, true);

        return service;
    }

    private _addPanel(service: ICentralPanelContentService, show = true) {
        this._panelServices.set(service.id, service);
        const length = this._panelIds.push(service.id);

        this._produceChangePanelEvent(service, ViewAction.Create);

        const index = length - 1;

        if (show) this._showPanel(index);

        return index;
    }

    // PANEL VISIBILITY

    private _showPanel(
        index: number,
        service: ICentralPanelContentService | null = null,
    ) {
        if (!service)
            service = this.getPanelByIndex(
                index,
            ) as ICentralPanelContentService;

        this._activePanelIndex = index;
        service.activate();

        this._produceChangePanelEvent(service, ViewAction.Show);
    }

    private _hidePanel(
        index: number,
        service: ICentralPanelContentService | null = null,
    ) {
        if (!service)
            service = this.getPanelByIndex(
                index,
            ) as ICentralPanelContentService;

        if (index > 0) this._activePanelIndex = index - 1;
        else this._activePanelIndex = null;

        this._produceChangePanelEvent(service, ViewAction.Hide);
    }

    // UPDATING PANELS

    changeEntryEditorView(id: string, viewType: EntryViewType) {
        const service = this.getPanel(id);
        if (!service) {
            console.error(`Central panel service ${id} not found.`);
            return;
        }

        const entryEditorService = service as EntryEditorService;
        entryEditorService.changeView(viewType);
    }

    // ACCESSING PANELS

    getPanel(id: string) {
        return this._panelServices.get(id) ?? null;
    }

    getPanelByIndex(index: number) {
        const id = this._panelIds[index];
        return this._panelServices.get(id) ?? null;
    }

    getHomePanel(): HomeManager | null {
        // assume that there can be at most one home panel
        const service = this._panelServices.get(CentralViewType.Home) ?? null;
        if (!service) return null;
        return service as HomeManager;
    }

    findPanelIndex(id: string) {
        for (let i = 0; i < this._panelIds.length; i++) {
            if (this._panelIds[i] === id) return i;
        }
        return null;
    }

    *iteratePanels() {
        for (const id of this._panelIds)
            yield this._panelServices.get(id) as ICentralPanelContentService;
    }

    // CLOSING PANELS

    closePanel(index: number) {
        const service = this.getPanelByIndex(index);
        if (!service) return;

        this._closePanel(index, service);

        this._panelIds.splice(index, 1);
        this._panelServices.delete(service.id);
    }

    private _closePanel(index: number, service: ICentralPanelContentService) {
        if (index == this._activePanelIndex) this._hidePanel(index, service);

        service.cleanUp();
        this._produceChangePanelEvent(service, ViewAction.Close);
    }

    clear() {
        for (let index = 0; index < this._panelIds.length; index++) {
            const service = this.getPanelByIndex(
                index,
            ) as ICentralPanelContentService;
            this._closePanel(index, service);
        }

        this._panelIds = [];
        this._panelServices.clear();
    }

    private _clearAndAddPanel(
        service: ICentralPanelContentService,
        show = true,
    ) {
        this.clear();
        this._addPanel(service, show);
    }

    private _produceChangePanelEvent(
        service: ICentralPanelContentService,
        action: ViewAction,
    ) {
        this.onChangePanel.produce({ action, details: service.details });
    }

    // SYNC

    fetchChanges(event: PollEvent) {
        const results: PollResultEntryData[] = [];

        for (const service of this._panelServices.values()) {
            if (service.type !== CentralViewType.EntryEditor) continue;

            const entryEditor = service as EntryEditorService;
            const result = entryEditor.fetchChanges(event);
            if (result === null) continue;

            results.push(result);
        }

        return results;
    }

    handleEntrySynchronization(event: SyncEvent) {
        for (const service of this._panelServices.values()) {
            if (service.type !== CentralViewType.EntryEditor) continue;

            const entryEditor = service as EntryEditorService;
            entryEditor.handleSynchronization(event.entries);
        }
    }
}
