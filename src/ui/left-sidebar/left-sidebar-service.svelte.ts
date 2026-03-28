import { DomainManager } from "@/services";
import type {
    // EntryInfoResponse,
    // FolderResponse,
    IComponentService,
} from "@/interface";

//import { SpotlightService } from "./spotlight";

export interface LeftSidebarServiceArgs {
    domain: DomainManager;
}

export class LeftSidebarService implements IComponentService {
    readonly key = "left-side-bar";
    readonly NAVBAR_WIDTH = 300;

    // SERVICES
    domain: DomainManager;
    //spotlight: SpotlightService;

    constructor({ domain }: LeftSidebarServiceArgs) {
        this.domain = domain;
        //this.spotlight = new SpotlightService({ domain });
    }

    get width() {
        return this.NAVBAR_WIDTH;
    }

    // load(entities: EntryInfoResponse[], folders: FolderResponse[]) {
    //     this.spotlight.load(entities, folders);
    // }

    // reset() {
    //     this.spotlight.cleanUp();
    // }
}
