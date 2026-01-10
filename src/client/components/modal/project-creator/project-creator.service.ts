import { makeAutoObservable } from "mobx";

import { CreateProjectEvent, IModalContentManager } from "@/client/interface";
import { ModalType } from "@/constants";
import { MultiEventProducer } from "@/model";

export class ProjectCreatorService implements IModalContentManager {
    readonly title = "Create a new project";

    private _name = "";
    private _dbFilePath = "";

    onCreateProject: MultiEventProducer<CreateProjectEvent, unknown>;
    onClose: MultiEventProducer<void, unknown>;

    constructor() {
        this.onCreateProject = new MultiEventProducer();
        this.onClose = new MultiEventProducer();
        makeAutoObservable(this, { onCreateProject: false, onClose: false });
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
