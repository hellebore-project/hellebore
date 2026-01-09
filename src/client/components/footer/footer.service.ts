import { DomainManager } from "@/domain";
import { IComponentService } from "@/interface";

export class FooterManager implements IComponentService {
    readonly key = "FOOTER";
    readonly DEFAULT_HEIGHT = 25;

    private _domain: DomainManager;

    constructor(domain: DomainManager) {
        this._domain = domain;
    }

    get height() {
        return this.DEFAULT_HEIGHT;
    }

    get text() {
        return this._domain.session.project?.name ?? "";
    }
}
