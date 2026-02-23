import { SvelteMap } from "svelte/reactivity";

import { CentralViewType, ViewAction } from "@/constants";
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
    readonly key = "central-panel";

    // STATE VARIABLES
    private _activePanelIndex: number | null = $state(null);
    private _panelKeys: string[] = $state([]);
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
        this._panelKeys = [];
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
        return this._panelKeys.length;
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

        const service = new EntryEditorService(this._domain);

        service.onOpenReferencedEntry.subscribe((args) =>
            this.openEntryEditor(args),
        );
        service.onChange.broker = this.onChangeData;
        service.onPartialChange.broker = this.onPartialChangeData;
        service.onPeriodicChange.broker = this.onPeriodicChangeData;
        service.onDelete.broker = this.onDeleteEntry;

        // NOTE: the entry-editor service needs to finish loading before we can proceed with
        // firing the event producers. The event payloads require the entry ID, which is
        // fetched during the loading sequence.
        await service.load(args);

        // only one panel can be open at a time
        this._clearAndAddPanel(service, true);

        return service;
    }

    private _addPanel(service: ICentralPanelContentService, show = true) {
        this._panelServices.set(service.key, service);
        const length = this._panelKeys.push(service.key);

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

    // ACCESSING PANELS

    getPanelByIndex(index: number) {
        const key = this._panelKeys[index];
        return this._panelServices.get(key) ?? null;
    }

    getHomePanel(): HomeManager | null {
        // assume that there can be at most one home panel
        const service = this._panelServices.get(CentralViewType.Home) ?? null;
        if (!service) return null;
        return service as HomeManager;
    }

    findPanelIndex(key: string) {
        for (let i = 0; i < this._panelKeys.length; i++) {
            if (this._panelKeys[i] === key) return i;
        }
        return null;
    }

    *iterateOpenPanels() {
        for (const key of this._panelKeys)
            yield this._panelServices.get(key) as ICentralPanelContentService;
    }

    // CLOSING PANELS

    closePanel(index: number) {
        const service = this.getPanelByIndex(index);
        if (!service) return;

        this._closePanel(index, service);

        this._panelKeys.splice(index, 1);
        this._panelServices.delete(service.key);
    }

    private _closePanel(index: number, service: ICentralPanelContentService) {
        if (index == this._activePanelIndex) this._hidePanel(index, service);

        service.cleanUp();
        this._produceChangePanelEvent(service, ViewAction.Close);
    }

    clear() {
        for (let index = 0; index < this._panelKeys.length; index++) {
            const service = this.getPanelByIndex(
                index,
            ) as ICentralPanelContentService;
            this._closePanel(index, service);
        }

        this._panelKeys = [];
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
