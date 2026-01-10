export type Consumer<I, O> = (arg: I) => O;

export class EventProducer<I, O> {
    private _consumer: Consumer<I, O> | null;
    private _broker: EventProducer<I, O> | null = null;

    constructor() {
        this._consumer = null;
    }

    get broker() {
        return this._broker;
    }

    set broker(broker: EventProducer<I, O> | null) {
        this._broker = broker;
    }

    subscribe(consumer: Consumer<I, O>) {
        this._consumer = consumer;
    }

    clear() {
        this._consumer = null;
    }

    produce(arg: I): O {
        if (this._consumer !== null) return this._consumer(arg);
        else if (this._broker) return this._broker.produce(arg);
        throw "EventProducer has not been set.";
    }
}

export class MultiEventProducer<I, O> {
    private _consumers: Consumer<I, O>[];
    private _broker: MultiEventProducer<I, O> | null = null;

    constructor() {
        this._consumers = [];
    }

    get broker() {
        return this._broker;
    }

    set broker(broker: MultiEventProducer<I, O> | null) {
        this._broker = broker;
    }

    subscribe(consumer: Consumer<I, O>) {
        this._consumers.push(consumer);
    }

    clear() {
        this._consumers = [];
    }

    produce(arg: I): O[] {
        const results = this._consumers.map((s) => s(arg));
        if (this._broker) results.push(...this._broker.produce(arg));
        return results;
    }
}
