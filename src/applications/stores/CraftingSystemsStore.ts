import {DefaultCraftingSystem} from "../../scripts/system/CraftingSystem";
import {get, Subscriber, Updater, writable, Writable} from "svelte/store";

class CraftingSystemsStore {

    private readonly _craftingSystems: Writable<DefaultCraftingSystem[]>;

    constructor({
        craftingSystems = []
    }: {
        craftingSystems?: DefaultCraftingSystem[];
    }) {
        this._craftingSystems = writable(this.sort(craftingSystems));
    }

    public subscribe(subscriber: Subscriber<DefaultCraftingSystem[]>) {
        return this._craftingSystems.subscribe(subscriber);
    }

    public set(value: DefaultCraftingSystem[]) {
        return this._craftingSystems.set(this.sort(value));
    }

    public update(updater: Updater<DefaultCraftingSystem[]>) {
        return this._craftingSystems.update((value) => {
            return this.sort(updater(value));
        });
    }

    public read(): DefaultCraftingSystem[] {
        return get(this._craftingSystems);
    }

    private sort(craftingSystems: DefaultCraftingSystem[]): DefaultCraftingSystem[] {
        return craftingSystems.sort((left, right) => {
            if (left.isEmbedded && !right.isEmbedded) {
                return -1;
            }
            if (right.isEmbedded && !left.isEmbedded) {
                return 1;
            }
            return left.details.name.localeCompare(right.details.name);
        });
    }

}

export { CraftingSystemsStore }