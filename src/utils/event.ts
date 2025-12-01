export type Subscription<I, O> = (arg: I) => O;

export class EventProducer<I, O> {
    private _subscriptions: Subscription<I, O>[];
    private _broker: EventProducer<I, O> | null = null;

    constructor() {
        this._subscriptions = [];
    }

    get broker() {
        return this._broker;
    }

    set broker(broker: EventProducer<I, O> | null) {
        this._broker = broker;
    }

    get subscriptions() {
        return this._subscriptions;
    }

    set subscriptions(subs: Subscription<I, O>[]) {
        this._subscriptions = subs;
    }

    subscribe(subscription: Subscription<I, O>) {
        this._subscriptions.push(subscription);
    }

    clear() {
        this._subscriptions = [];
    }

    produce(arg: I) {
        const results = this._subscriptions.map((s) => s(arg));
        if (this._broker) results.push(...this._broker.produce(arg));
        return results;
    }

    produceOne(arg: I): O {
        if (this._subscriptions.length > 0) return this._subscriptions[0](arg);
        else if (this._broker) return this._broker.produceOne(arg);
        throw "Event producer does not have any subscriptions.";
    }
}
