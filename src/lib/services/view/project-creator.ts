import { makeAutoObservable } from "mobx";

export class ProjectCreatorService {
    _name: string = "";
    _dbFilePath: string = "";

    constructor() {
        makeAutoObservable(this);
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

    reset() {
        this._name = "";
        this._dbFilePath = "";
    }
}
