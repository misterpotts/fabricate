import {CraftingSystem} from "../../scripts/system/CraftingSystem";
import {get, Subscriber, Updater, writable, Writable} from "svelte/store";

class CraftingSystemsStore {

    private readonly _craftingSystems: Writable<CraftingSystem[]>;

    constructor({
        craftingSystems = []
    }: {
        craftingSystems?: CraftingSystem[];
    }) {
        this._craftingSystems = writable(this.sort(craftingSystems));
    }

    public subscribe(subscriber: Subscriber<CraftingSystem[]>) {
        return this._craftingSystems.subscribe(subscriber);
    }

    public set(value: CraftingSystem[]) {
        return this._craftingSystems.set(this.sort(value));
    }

    public update(updater: Updater<CraftingSystem[]>) {
        return this._craftingSystems.update((value) => {
            return this.sort(updater(value));
        });
    }

    public read(): CraftingSystem[] {
        return get(this._craftingSystems);
    }

    private sort(craftingSystems: CraftingSystem[]): CraftingSystem[] {
        return craftingSystems.sort((left, right) => {
            if (left.isLocked && !right.isLocked) {
                return -1;
            }
            if (right.isLocked && !left.isLocked) {
                return 1;
            }
            return left.name.localeCompare(right.name);
        });
    }

}

export { CraftingSystemsStore }