import {CraftingSystem} from "../../scripts/system/CraftingSystem";
import {derived, Readable, Subscriber} from "svelte/store";
import {Component} from "../../scripts/crafting/component/Component";
import {FabricateAPI} from "../../scripts/api/FabricateAPI";

class CraftingComponentsStore {

    private readonly _craftingComponents: Readable<Component[]>;
    private readonly _fabricateAPI: FabricateAPI;

    constructor({
        fabricateAPI,
        selectedCraftingSystem,
    }: {
        fabricateAPI: FabricateAPI;
        selectedCraftingSystem: Readable<CraftingSystem>;
    }) {
        this._fabricateAPI = fabricateAPI;
        this._craftingComponents = derived(
            selectedCraftingSystem,
            ($selectedCraftingSystem, set) => {
                if (!$selectedCraftingSystem) {
                    set([]);
                    return;
                }
                this._fabricateAPI.components.getAllByCraftingSystemId($selectedCraftingSystem.id)
                    .then((components) => {
                        set(Array.from(components.values()));
                    });
            });
    }

    public subscribe(subscriber: Subscriber<Component[]>) {
        return this._craftingComponents.subscribe(subscriber);
    }

}

export { CraftingComponentsStore }