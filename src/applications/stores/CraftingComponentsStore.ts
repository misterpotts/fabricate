import {CraftingSystem} from "../../scripts/system/CraftingSystem";
import {derived, Readable, Subscriber} from "svelte/store";
import {CraftingComponent} from "../../scripts/common/CraftingComponent";

class CraftingComponentsStore {

    private readonly _craftingComponents: Readable<CraftingComponent[]>;

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

    public subscribe(subscriber: Subscriber<CraftingComponent[]>) {
        return this._craftingComponents.subscribe(subscriber);
    }

}

export { CraftingComponentsStore }