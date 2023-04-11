import {derived, Readable, Subscriber} from "svelte/store";
import {Essence} from "../../scripts/crafting/essence/Essence";
import {CraftingSystem} from "../../scripts/system/CraftingSystem";
import {Component} from "../../scripts/crafting/component/Component";
import {Unit} from "../../scripts/common/Unit";

class ComponentEssenceStore {

    private readonly _essences: Readable<Unit<Essence>[]>;

    constructor({
        selectedCraftingSystem,
        selectedComponent
    }: {
        selectedCraftingSystem: Readable<CraftingSystem>;
        selectedComponent: Readable<Component>;
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