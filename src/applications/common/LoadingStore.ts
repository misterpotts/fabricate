import {get, Subscriber, Updater, writable, Writable} from "svelte/store";

class LoadingStore {

    private readonly _loading: Writable<boolean>;

    constructor({
        loading = false
    }: {
        loading?: boolean;
    }) {
        this._loading = writable(loading);
    }

    public subscribe(subscriber: Subscriber<boolean>) {
        return this._loading.subscribe(subscriber);
    }

    public set(value: boolean) {
        return this._loading.set(value);
    }

    public update(updater: Updater<boolean>) {
        return this._loading.update(updater);
    }

    public read(): boolean {
        return get(this._loading);
    }
    
}

export { LoadingStore }