import {DefaultCraftingSystem} from "../../scripts/system/CraftingSystem";
import {get, Readable, Subscriber, Updater, writable, Writable} from "svelte/store";

class SelectedCraftingSystemStore {

    private readonly _selectedCraftingSystem: Writable<DefaultCraftingSystem>;

    constructor({
        craftingSystems,
        selectedSystem
    }: {
        craftingSystems: Readable<DefaultCraftingSystem[]>;
        selectedSystem?: DefaultCraftingSystem;
    }) {
        this._selectedCraftingSystem = writable(selectedSystem);
        this.shadowCraftingSystemUpdates(craftingSystems);
    }

    private shadowCraftingSystemUpdates(craftingSystems: Readable<DefaultCraftingSystem[]>) {
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

    public subscribe(subscriber: Subscriber<DefaultCraftingSystem>) {
        return this._selectedCraftingSystem.subscribe(subscriber);
    }

    public set(value: DefaultCraftingSystem) {
        return this._selectedCraftingSystem.set(value);
    }

    public update(updater: Updater<DefaultCraftingSystem>) {
        this._selectedCraftingSystem.update(updater);
    }

}

export { SelectedCraftingSystemStore }