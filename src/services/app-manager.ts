import { DomainManager } from "./domain";
import { ViewManager } from "./view";

export class AppManager {
    domain: DomainManager;
    view: ViewManager;

    constructor() {
        this.domain = new DomainManager();
        this.view = new ViewManager(this.domain);
    }

    initialize() {
        this.view.fetchProjectInfo().then((project) => {
            if (project) this.view.populateNavigator();
        });
    }
}
