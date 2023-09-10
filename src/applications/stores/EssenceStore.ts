import {CraftingSystem} from "../../scripts/system/CraftingSystem";
import {Readable, Subscriber, Updater, writable, Writable, get} from "svelte/store";
import {FabricateAPI} from "../../scripts/api/FabricateAPI";
import {Essence} from "../../scripts/crafting/essence/Essence";

class EssencesStore implements Writable<Essence[]> {

    private readonly _essences: Writable<Essence[]>;
    private readonly _fabricateAPI: FabricateAPI;

    constructor({
        fabricateAPI,
        selectedCraftingSystem,
        initialValue = [],
    }: {
        fabricateAPI: FabricateAPI;
        selectedCraftingSystem: Readable<CraftingSystem>;
        initialValue?: Essence[];
    }) {
        this._fabricateAPI = fabricateAPI;
        this._essences = writable(initialValue);
        this.watchSelectedCraftingSystem(selectedCraftingSystem);
    }

    private watchSelectedCraftingSystem(selectedCraftingSystem: Readable<CraftingSystem>) {
        selectedCraftingSystem.subscribe((craftingSystem) => {
            if (!craftingSystem) {
                this._essences.set([]);
                return;
            }
            this._fabricateAPI.essences.getAllByCraftingSystemId(craftingSystem.id)
                .then((essences) => {
                    this._essences.set(Array.from(essences.values()));
                });
        });
    }

    public get(): Essence[] {
        return get(this._essences);
    }

    public subscribe(subscriber: Subscriber<Essence[]>) {
        return this._essences.subscribe(subscriber);
    }

    set(value: Essence[]): void {
        this._essences.set(value);
    }

    update(updater: Updater<Essence[]>): void {
        this._essences.update(updater);
    }

    insert(essence: Essence) {
        this._essences.update((essences) => {
            const index = essences.findIndex((candidate) => candidate.id === essence.id);
            if (index === -1) {
                essences.push(essence);
                return essences;
            }
            essences[index] = essence;
            return essences;
        });
    }

    remove(essence: Essence) {
        this._essences.update((components) => {
            const index = components.findIndex((candidate) => candidate.id === essence.id);
            if (index === -1) {
                return components;
            }
            components.splice(index, 1);
            return components;
        });
    }

}

export { EssencesStore }