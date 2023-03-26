import {CraftingSystem} from "../../scripts/system/CraftingSystem";
import {derived, Readable, Subscriber} from "svelte/store";
import {Component} from "../../scripts/crafting/component/Component";

class CraftingComponentsStore {

    private readonly _craftingComponents: Readable<Component[]>;

    constructor({
        selectedCraftingSystem
    }: {
        selectedCraftingSystem: Readable<CraftingSystem>;
    }) {
        this._craftingComponents = derived(
            selectedCraftingSystem,
            ($selectedCraftingSystem, set) => set($selectedCraftingSystem?.craftingComponents ?? [])
        );
    }

    public subscribe(subscriber: Subscriber<Component[]>) {
        return this._craftingComponents.subscribe(subscriber);
    }

}

export { CraftingComponentsStore }