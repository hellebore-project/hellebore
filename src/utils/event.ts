export type Subscription<I, O> = (arg: I) => O;

export class EventProducer<I, O> {
    private _subscriptions: Subscription<I, O>[];

    constructor() {
        this._subscriptions = [];
    }

    subscribe(subscription: Subscription<I, O>) {
        this._subscriptions.push(subscription);
    }

    produce(arg: I) {
        return this._subscriptions.map((s) => s(arg));
    }
}
