import { DomainService } from "./domain";
import { ViewService } from "./view";

export class AppService {
    domain: DomainService;
    view: ViewService;

    constructor() {
        this.domain = new DomainService();
        this.view = new ViewService(this.domain);

        this.view.fetchProjectInfo().then((project) => {
            if (project) this.view.populateNavigator();
        });
    }
}
