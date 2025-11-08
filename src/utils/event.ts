export type Subscription<I, O> = (arg: I) => O;

export class EventProducer<I, O> {
    private _subscriptions: Subscription<I, O>[];

    constructor() {
        this._subscriptions = [];
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
        return this._subscriptions.map((s) => s(arg));
    }

    produceOne(arg: I) {
        return this._subscriptions[0](arg);
    }
}
