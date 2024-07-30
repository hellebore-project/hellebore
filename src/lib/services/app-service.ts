import ViewService from "./view-service";

class AppService {
    view: ViewService;

    constructor() {
        this.view = new ViewService();
    }
}

export default AppService;
