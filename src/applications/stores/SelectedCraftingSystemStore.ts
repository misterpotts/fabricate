import {CraftingSystem} from "../../scripts/system/CraftingSystem";
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
        this.loadWhenSelected(this._selectedCraftingSystem);
        this.shadowCraftingSystemUpdates(craftingSystems);
    }

    private async reload(target?: CraftingSystem) {
        const selectedSystem = target ?? get(this._selectedCraftingSystem);
        if (!selectedSystem) {
            return;
        }
        await selectedSystem.reload();
        return selectedSystem;
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
            const found = value.find(system => system === selectedSystem);
            if (!found) {
                this._selectedCraftingSystem.set(value[0]);
                return;
            }
            Promise.resolve(this.reload(found))
                .then(loaded => this._selectedCraftingSystem.set(loaded))
                .catch(e => console.error(`Unable to reload crafting system. ${e instanceof Error ? e.stack : e}`));
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