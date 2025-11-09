import { makeAutoObservable } from "mobx";

import { CreateProjectEvent, IModalContentManager } from "@/client/interface";
import { ModalKey } from "@/client/constants";
import { EventProducer } from "@/utils/event";

export class ProjectCreator implements IModalContentManager {
    readonly TITLE = "Create a new project";

    private _name = "";
    private _dbFilePath = "";

    onCreateProject: EventProducer<CreateProjectEvent, unknown>;
    onClose: EventProducer<void, unknown>;

    constructor() {
        this.onCreateProject = new EventProducer();
        this.onClose = new EventProducer();
        makeAutoObservable(this, { onCreateProject: false, onClose: false });
    }

    get key() {
        return ModalKey.ProjectCreator;
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
