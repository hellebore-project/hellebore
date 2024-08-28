import DataService from "./data";
import ViewService from "./view-service";

class AppService {
    data: DataService;
    view: ViewService;

    constructor() {
        this.data = new DataService();
        this.view = new ViewService(this.data);

        this.data.articles.getAll();
    }
}

export default AppService;
