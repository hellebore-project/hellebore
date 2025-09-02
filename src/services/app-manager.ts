import { DomainManager } from "./domain";
import { ViewManager } from "./view";

export class AppManager {
    domain: DomainManager;
    view: ViewManager;

    constructor() {
        this.domain = new DomainManager();
        this.view = new ViewManager(this.domain);
    }

    async initialize() {
        const project = await this.view.fetchProjectInfo();
        if (project) this.view.populateNavigator();
    }
}
