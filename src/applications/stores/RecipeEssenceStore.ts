import {derived, Readable, Subscriber} from "svelte/store";
import {Essence} from "../../scripts/crafting/essence/Essence";
import {Unit} from "../../scripts/common/Combination";
import {CraftingSystem} from "../../scripts/system/CraftingSystem";
import {Recipe} from "../../scripts/crafting/recipe/Recipe";

class RecipeEssenceStore {

    private readonly _essences: Readable<Unit<Essence>[]>;

    constructor({
        selectedCraftingSystem,
        selectedRecipe
    }: {
        selectedCraftingSystem: Readable<CraftingSystem>;
        selectedRecipe: Readable<Recipe>;
    }) {
        this._essences = derived(
            [selectedCraftingSystem, selectedRecipe],
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

export {RecipeEssenceStore }