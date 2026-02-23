import { DomainManager } from "@/services";
import type { IComponentService } from "@/interface";

export class FooterManager implements IComponentService {
    readonly key = "footer";

    private _domain: DomainManager;

    constructor(domain: DomainManager) {
        this._domain = domain;
    }

    get text() {
        return this._domain.session.project?.name ?? "";
    }
}
