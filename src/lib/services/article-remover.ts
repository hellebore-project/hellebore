import { makeAutoObservable } from "mobx";

export class ArticleRemoverService {
    _id: number | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    get id() {
        return this._id;
    }

    set id(id: number | null) {
        this._id = id;
    }

    initialize(id: number | null) {
        this._id = id;
    }

    reset() {
        this.id = null;
    }
}
