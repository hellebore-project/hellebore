export class Counter {
    _index: number = 0;

    constructor(start: number = 0) {
        this._index = start;
    }

    increment() {
        this._index++;
        return this._index;
    }
}
