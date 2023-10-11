import {CraftingSystem} from "../../scripts/crafting/system/CraftingSystem";
import {get, Readable, Subscriber, Updater, writable, Writable} from "svelte/store";

class SelectedCraftingSystemStore {

    private readonly _selectedCraftingSystem: Writable<CraftingSystem>;

    constructor({
        craftingSystems,
        selectedSystem
    }: {
        craftingSystems: Readable<CraftingSystem[]>;
        selectedSystem?: CraftingSystem;
    }) {
        this._selectedCraftingSystem = writable(selectedSystem);
        this.shadowCraftingSystemUpdates(craftingSystems);
    }

    private shadowCraftingSystemUpdates(craftingSystems: Readable<CraftingSystem[]>) {
        craftingSystems.subscribe(value => {
            if (!value) {
                throw new Error("Crafting systems may not be null");
            }
            if (value.length === 0) {
                this._selectedCraftingSystem.set(null);
            }
            const selectedSystem = get(this._selectedCraftingSystem);
            const found = value.find(system => system.id === selectedSystem?.id);
            if (!found) {
                this._selectedCraftingSystem.set(value[0]);
                return;
            }
            this._selectedCraftingSystem.set(found);
        });
    }

    public subscribe(subscriber: Subscriber<CraftingSystem>) {
        return this._selectedCraftingSystem.subscribe(subscriber);
    }

    public set(value: CraftingSystem) {
        return this._selectedCraftingSystem.set(value);
    }

    public update(updater: Updater<CraftingSystem>) {
        this._selectedCraftingSystem.update(updater);
    }

}

export { SelectedCraftingSystemStore }