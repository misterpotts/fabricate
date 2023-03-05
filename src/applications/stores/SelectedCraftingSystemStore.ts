import {CraftingSystem} from "../../scripts/system/CraftingSystem";
import {get, Readable, Subscriber, Updater, writable, Writable} from "svelte/store";

class SelectedCraftingSystemStore {

    private readonly _selectedCraftingSystem: Writable<CraftingSystem>;

    constructor({
        craftingSystems,
        selectedSystem
    }: {
        craftingSystems: Readable<CraftingSystem[]>;
        selectedSystem: CraftingSystem;
    }) {
        this._selectedCraftingSystem = writable(selectedSystem);
        this.loadWhenSelected(this._selectedCraftingSystem);
        this.reselectWhenDeleted(craftingSystems);
    }

    private reselectWhenDeleted(craftingSystems: Readable<CraftingSystem[]>) {
        craftingSystems.subscribe(value => {
            if (!value) {
                throw new Error("Crafting systems may not be null");
            }
            if (value.length === 0) {
                this._selectedCraftingSystem.set(null);
            }
            const selectedSystem = get(this._selectedCraftingSystem);
            const found = value.find(system => system === selectedSystem);
            if (found) {
                return;
            }
            this._selectedCraftingSystem.set(value[0]);
        });
    }

    private loadWhenSelected(selectedCraftingSystem: Writable<CraftingSystem>) {
        selectedCraftingSystem.subscribe((value) => {
            if (!value) {
                return;
            }
            if (!value.isLoaded) {
                Promise
                    .resolve(value.loadPartDictionary())
                    .then(() => selectedCraftingSystem.set(value));
            }
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