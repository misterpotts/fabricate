import {derived, Readable, Subscriber} from "svelte/store";
import {Essence} from "../../scripts/common/Essence";
import {Unit} from "../../scripts/common/Combination";
import {CraftingSystem} from "../../scripts/system/CraftingSystem";
import {CraftingComponent} from "../../scripts/common/CraftingComponent";

class ComponentEssenceStore {

    private readonly _essences: Readable<Unit<Essence>[]>;

    constructor({
        selectedCraftingSystem,
        selectedComponent
    }: {
        selectedCraftingSystem: Readable<CraftingSystem>;
        selectedComponent: Readable<CraftingComponent>;
    }) {
        this._essences = derived(
            [selectedCraftingSystem, selectedComponent],
            ([$selectedSystem, $selectedCraftingComponent], set) => {
                if (!$selectedSystem || !$selectedSystem.hasEssences || !$selectedCraftingComponent) {
                    set([]);
                    return;
                }
                const essences = $selectedSystem.getEssences().map(essence => {
                    return new Unit(essence, $selectedCraftingComponent.essences.amountFor(essence.id));
                });
                set(essences);
            });
    }

    public subscribe(subscriber: Subscriber<Unit<Essence>[]>) {
        return this._essences.subscribe(subscriber);
    }
}

export {ComponentEssenceStore }