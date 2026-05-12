import { DomainManager } from "@/services";
import type {
    IComponentService,
    LoadProjectEvent,
    SyncEvent,
} from "@/interface";

export class FooterManager implements IComponentService {
    readonly id = "footer";

    private _projectName: string = $state("");

    private _domain: DomainManager;

    constructor(domain: DomainManager) {
        this._domain = domain;
    }

    get text() {
        return this._projectName;
    }

    // SYNC

    handleProjectChange(event: LoadProjectEvent) {
        if (event.loaded && event.project)
            this._projectName = event.project.name;
        else this._projectName = "";
    }

    handleSynchronization(event: SyncEvent) {
        if (event.project) {
            const response = event.project.response;
            if (response.project) this._projectName = response.project.name;
        }
    }
}
