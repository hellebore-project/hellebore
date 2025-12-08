import { makeAutoObservable } from "mobx";

import { CentralViewType, ViewAction } from "@/client/constants";
import {
    ChangeCentralPanelEvent,
    ChangeEntryEvent,
    ICentralPanelContentManager,
    OpenEntryEditorEvent,
    PollEvent,
    SyncEntryEvent,
    WordMetaData,
} from "@/client/interface";
import { DomainManager } from "@/domain";
import { SpreadsheetReferenceService } from "@/shared/spreadsheet";
import { EventProducer } from "@/utils/event";

import { HomeManager } from "./home-manager";
import { SettingsEditorService } from "./settings-editor";
import { EntryEditorService, EntryEditorServiceArgs } from "./entry-editor";
import { WordColumnKeys } from "./entry-editor/word-editor";

type PrivateKeys =
    | "_panels"
    | "_entryEditorArgs"
    | "_domain"
    | "_spreadsheetReference";

export interface CentralPanelManagerArgs {
    domain: DomainManager;
}

export class CentralPanelManager {
    // STATE VARIABLES
    private _activePanelIndex: number | null = null;
    private _panelKeys: string[];
    private _panels: Map<string, ICentralPanelContentManager>;
    private _entryEditorArgs: EntryEditorServiceArgs;

    // SERVICES
    private _domain: DomainManager;
    // When there are multiple entry-editor tabs that exist concurrently,
    // they all share the same spreadsheet reference, but only a single one
    // of them is hooked to it at a time.
    private _spreadsheetReference: SpreadsheetReferenceService<
        WordColumnKeys,
        WordMetaData
    >;

    // EVENTS
    onChangePanel: EventProducer<ChangeCentralPanelEvent, unknown>;
    onChangeData: EventProducer<ChangeEntryEvent, unknown>;
    onPartialChangeData: EventProducer<ChangeEntryEvent, unknown>;
    onChangeDataDelayed: EventProducer<ChangeEntryEvent, unknown>;

    constructor({ domain }: CentralPanelManagerArgs) {
        this._panelKeys = [];
        this._panels = new Map();

        this._spreadsheetReference = new SpreadsheetReferenceService();
        this._entryEditorArgs = {
            domain,
            wordEditor: {
                spreadsheet: {
                    reference: this._spreadsheetReference,
                },
            },
        };

        this._domain = domain;

        this.onChangePanel = new EventProducer();
        this.onChangeData = new EventProducer();
        this.onPartialChangeData = new EventProducer();
        this.onChangeDataDelayed = new EventProducer();

        makeAutoObservable<CentralPanelManager, PrivateKeys>(this, {
            _panels: false,
            _entryEditorArgs: false,
            _domain: false,
            _spreadsheetReference: false,
            onChangePanel: false,
            onChangeData: false,
            onPartialChangeData: false,
            onChangeDataDelayed: false,
        });
    }

    // PROPERTIES

    get panelCount() {
        return this._panelKeys.length;
    }

    get activePanel() {
        if (this._activePanelIndex === null) return null;
        return this.getPanelByIndex(this._activePanelIndex);
    }

    // OPENING PANELS

    openHome() {
        const currentIndex = this.findPanelIndex(CentralViewType.Home);
        if (currentIndex !== null) {
            this._showPanel(currentIndex);
            return this.getPanelByIndex(currentIndex) as HomeManager;
        }

        const panel = new HomeManager(this._domain);

        panel.load(this._domain.projectName ?? "");

        // only one panel can be open at a time
        this._clearAndAddPanel(panel, true);

        return panel;
    }

    openSettings() {
        const currentIndex = this.findPanelIndex(CentralViewType.Settings);
        if (currentIndex !== null) {
            this._showPanel(currentIndex);
            return this.getPanelByIndex(currentIndex) as SettingsEditorService;
        }

        const panel = new SettingsEditorService();

        // only one panel can be open at a time
        this._clearAndAddPanel(panel, true);

        return panel;
    }

    async openEntryEditor(args: OpenEntryEditorEvent) {
        const key = EntryEditorService.generateKey(
            CentralViewType.EntryEditor,
            args.id,
        );

        const currentIndex = this.findPanelIndex(key);
        if (currentIndex !== null) {
            this._showPanel(currentIndex);
            return this.getPanelByIndex(currentIndex) as EntryEditorService;
        }

        const panel = new EntryEditorService(this._entryEditorArgs);

        panel.onChange.broker = this.onChangeData;
        panel.onPartialChange.broker = this.onPartialChangeData;
        panel.onChangeDelayed.broker = this.onChangeDataDelayed;

        panel.load(args);

        // only one panel can be open at a time
        this._clearAndAddPanel(panel, true);

        return panel;
    }

    private _addPanel(panel: ICentralPanelContentManager, show = true) {
        this._panels.set(panel.key, panel);
        const length = this._panelKeys.push(panel.key);

        this._produceChangePanelEvent(panel, ViewAction.Create);

        const index = length - 1;

        if (show) this._showPanel(index);

        return index;
    }

    // PANEL VISIBILITY

    private _showPanel(
        index: number,
        panel: ICentralPanelContentManager | null = null,
    ) {
        if (!panel)
            panel = this.getPanelByIndex(index) as ICentralPanelContentManager;

        this._activePanelIndex = index;
        panel.activate();

        this._produceChangePanelEvent(panel, ViewAction.Show);
    }

    private _hidePanel(
        index: number,
        panel: ICentralPanelContentManager | null = null,
    ) {
        if (!panel)
            panel = this.getPanelByIndex(index) as ICentralPanelContentManager;

        if (index > 0) this._activePanelIndex = index - 1;
        else this._activePanelIndex = null;

        this._produceChangePanelEvent(panel, ViewAction.Hide);
    }

    // ACCESSING PANELS

    getPanelByIndex(index: number) {
        const key = this._panelKeys[index];
        return this._panels.get(key) ?? null;
    }

    getHomePanel() {
        // assume that there can be at most one home panel
        const panel = this._panels.get(CentralViewType.Home) ?? null;
        if (!panel) return panel;
        return panel as HomeManager;
    }

    findPanelIndex(key: string) {
        for (let i = 0; i < this._panelKeys.length; i++) {
            if (this._panelKeys[i] === key) return i;
        }
        return null;
    }

    *iterateOpenPanels() {
        for (const key of this._panelKeys)
            yield this._panels.get(key) as ICentralPanelContentManager;
    }

    // CLOSING PANELS

    closePanel(index: number) {
        const panel = this.getPanelByIndex(index);
        if (!panel) return;

        this._closePanel(index, panel);

        this._panelKeys.splice(index, 1);
        this._panels.delete(panel.key);
    }

    private _closePanel(index: number, panel: ICentralPanelContentManager) {
        if (index == this._activePanelIndex) this._hidePanel(index, panel);

        panel.cleanUp();
        this._produceChangePanelEvent(panel, ViewAction.Close);
    }

    clear() {
        for (let index = 0; index < this._panelKeys.length; index++) {
            const panel = this.getPanelByIndex(
                index,
            ) as ICentralPanelContentManager;
            this._closePanel(index, panel);
        }

        this._panelKeys = [];
        this._panels.clear();
    }

    private _clearAndAddPanel(panel: ICentralPanelContentManager, show = true) {
        this.clear();
        this._addPanel(panel, show);
    }

    private _produceChangePanelEvent(
        panel: ICentralPanelContentManager,
        action: ViewAction,
    ) {
        this.onChangePanel.produce({ action, details: panel.details });
    }

    // SYNC

    fetchChanges(event: PollEvent) {
        const results = [];

        for (const panel of this._panels.values()) {
            if (panel.type !== CentralViewType.EntryEditor) continue;

            const entryEditor = panel as EntryEditorService;
            const result = entryEditor.fetchChanges(event);
            if (result === null) continue;

            results.push(result);
        }

        return results;
    }

    handleEntrySynchronization(event: SyncEntryEvent) {
        for (const panel of this._panels.values()) {
            if (panel.type !== CentralViewType.EntryEditor) continue;

            const entryEditor = panel as EntryEditorService;
            entryEditor.handleSynchronization(event);
        }
    }

    // HOOKS

    hook() {
        this._spreadsheetReference.hook();
    }
}
