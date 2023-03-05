import {CraftingSystem} from "../../scripts/system/CraftingSystem";
import {Subscriber, Updater, writable, Writable} from "svelte/store";

class CraftingSystemsStore {

    private readonly _craftingSystems: Writable<CraftingSystem[]>;

    constructor({
        craftingSystems
    }: {
        craftingSystems: CraftingSystem[];
    }) {
        this._craftingSystems = writable(craftingSystems);
    }

    public subscribe(subscriber: Subscriber<CraftingSystem[]>) {
        return this._craftingSystems.subscribe(subscriber);
    }

    public set(value: CraftingSystem[]) {
        return this._craftingSystems.set(value);
    }

    public update(updater: Updater<CraftingSystem[]>) {
        return this._craftingSystems.update(updater);
    }

}

export { CraftingSystemsStore }