import {CraftingSystem} from "../../scripts/system/CraftingSystem";
import {derived, Readable, Subscriber} from "svelte/store";
import {Recipe} from "../../scripts/crafting/recipe/Recipe";

class RecipesStore {

    private readonly _recipes: Readable<Recipe[]>;

    constructor({
        selectedCraftingSystem
    }: {
        selectedCraftingSystem: Readable<CraftingSystem>;
    }) {
        this._recipes = derived(
            selectedCraftingSystem,
            ($selectedCraftingSystem, set) => set($selectedCraftingSystem?.recipes ?? [])
        );
    }

    public subscribe(subscriber: Subscriber<Recipe[]>) {
        return this._recipes.subscribe(subscriber);
    }

}

export { RecipesStore }