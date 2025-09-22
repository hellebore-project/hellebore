export class Counter {
    _index = 0;

    constructor(start = 0) {
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
