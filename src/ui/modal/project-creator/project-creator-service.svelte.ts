import { ModalType } from "@/constants";
import type { CreateProjectEvent, IModalContentManager } from "@/interface";
import { MultiEventProducer } from "@/utils/event-producer";

export class ProjectCreatorService implements IModalContentManager {
    readonly id = "modal-project-creator";
    readonly title = "Create a new project";

    private _name = $state("");
    private _dbFilePath = $state("");

    onCreateProject: MultiEventProducer<CreateProjectEvent, unknown>;
    onClose: MultiEventProducer<void, unknown>;

    constructor() {
        this.onCreateProject = new MultiEventProducer();
        this.onClose = new MultiEventProducer();
    }

    get key() {
        return ModalType.ProjectCreator;
    }

    get name() {
        return this._name;
    }

    set name(name: string) {
        this._name = name;
    }

    get dbFilePath() {
        return this._dbFilePath;
    }

    set dbFilePath(path: string) {
        this._dbFilePath = path;
    }

    initialize() {
        this._name = "";
        this._dbFilePath = "";
    }

    async submit() {
        this.onCreateProject.produce({
            name: this.name,
            dbFilePath: this.dbFilePath,
        });
        this.onClose.produce();
    }
}
