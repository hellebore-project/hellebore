export interface DebouncerResolved<T> {
    status: "resolved";
    value: T;
}

export interface DebouncerRejected {
    status: "rejected";
    reason: unknown;
}

export type DebouncerResult<T> = DebouncerResolved<T> | DebouncerRejected;

export class ReplaceDebouncer<TArgs, TResult> {
    private _fn: (args: TArgs) => Promise<DebouncerResult<TResult>>;
    waitTime: number;
    private _timer: ReturnType<typeof setTimeout> | null = null;
    private _pending: Promise<TResult> | null = null;

    constructor(
        fn: (args: TArgs) => Promise<DebouncerResult<TResult>>,
        waitTime = 300,
    ) {
        this._fn = fn;
        this.waitTime = waitTime;
    }

    get pending(): Promise<TResult> | null {
        return this._pending;
    }

    call(args: TArgs): Promise<TResult> {
        if (this._timer !== null) {
            clearTimeout(this._timer);
            this._timer = null;
        }

        const promise = new Promise<TResult>((resolve, reject) => {
            this._timer = setTimeout(async () => {
                this._timer = null;
                this._pending = null;

                let result: DebouncerResult<TResult>;
                try {
                    result = await this._fn(args);
                } catch (error) {
                    reject(error);
                    return;
                }

                if (result.status === "resolved") resolve(result.value);
                else reject(result.reason);
            }, this.waitTime);
        });

        this._pending = promise;
        return promise;
    }

    cancel() {
        if (this._timer !== null) {
            clearTimeout(this._timer);
            this._timer = null;
        }
        this._pending = null;
    }
}

export class BlockingDebouncer<TArgs, TResult> {
    private _fn: (args: TArgs) => Promise<DebouncerResult<TResult>>;
    private _pending: Promise<TResult> | null = null;

    constructor(fn: (args: TArgs) => Promise<DebouncerResult<TResult>>) {
        this._fn = fn;
    }

    get pending(): Promise<TResult> | null {
        return this._pending;
    }

    call(args: TArgs): Promise<TResult> | null {
        if (this._pending !== null) return null;

        const promise = new Promise<TResult>((resolve, reject) => {
            this._fn(args).then((result) => {
                this._pending = null;
                if (result.status === "resolved") resolve(result.value);
                else reject(result.reason);
            }, reject);
        });

        this._pending = promise;
        return promise;
    }

    cancel() {
        this._pending = null;
    }
}
