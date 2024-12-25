import { DomainService } from "./domain";
import { ViewService } from "./view-service";

export class AppService {
    domain: DomainService;
    view: ViewService;

    constructor() {
        this.domain = new DomainService();
        this.view = new ViewService(this.domain);

        this.view.fetchProjectInfo();
        this.view.populateNavigator();
    }
}
