import { CentralViewType, SyncType } from "@/constants";
import type {
    ICentralPanelContentService,
    LoadProjectEvent,
    PollEvent,
    PollResultProjectData,
    ProjectChangeEvent,
    SyncProjectEvent,
} from "@/interface";
import { DomainManager } from "@/api";
import { MultiEventProducer } from "@/utils/event-producer";

import type { HomeLoadArgs } from "./home-interface";

export class HomeManager implements ICentralPanelContentService {
    private _isProjectLoaded: boolean = $state(false);
    private _projectName: string = $state("");
    private _changed: boolean = $state(false);

    domain: DomainManager;

    onChange: MultiEventProducer<ProjectChangeEvent, unknown>;

    constructor(domain: DomainManager) {
        this.domain = domain;
        this.onChange = new MultiEventProducer();
    }

    get id() {
        return this.type;
    }

    get type() {
        return CentralViewType.Home;
    }

    get details() {
        return { id: this.id, type: this.type };
    }

    get isProjectLoaded() {
        return this._isProjectLoaded;
    }

    get projectName() {
        return this._projectName;
    }

    set projectName(name: string) {
        this._projectName = name;
        this._changed = true;
        this.onChange.produce({ nameChanged: true, syncImmediately: true });
    }

    load({ project }: HomeLoadArgs) {
        this._isProjectLoaded = project != null;
        this._projectName = project?.name ?? "";
    }

    activate() {
        return;
    }

    cleanUp() {
        return;
    }

    // SYNC

    handleProjectChange(event: LoadProjectEvent) {
        this._isProjectLoaded = event.loaded;
        if (event.loaded) this._projectName = event.project?.name ?? "";
        else this._projectName = "";
    }

    collectChanges(event: PollEvent): PollResultProjectData | null {
        if (!this._changed) return null;

        let syncName = false;
        if (event.type === SyncType.FULL) syncName = true;
        else if (event.type === SyncType.PARTIAL)
            syncName = event.project?.syncName ?? false;

        const changes: PollResultProjectData = {};
        if (syncName) changes.name = this._projectName;

        return changes;
    }

    handleSynchronization(event: SyncProjectEvent) {
        if (!event.response.project) return;

        if (this._changed && event.response.project.name === this._projectName)
            this._changed = false;

        this._projectName = event.response.project.name;
    }
}
