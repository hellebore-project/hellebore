import { IComponentService } from "@/interface";

export class PortalManager implements IComponentService {
    readonly key = "portal";

    private _id: string;

    constructor(id: string) {
        this._id = id;
    }

    get id() {
        return this._id;
    }

    get selector() {
        return `#${this._id}`;
    }
}
