export class Counter {
    _index: number = 0;

    constructor(start: number = 0) {
        this._index = start;
    }

    get index() {
        return this._index;
    }

    increment() {
        this._index++;
        return this._index;
    }
}
