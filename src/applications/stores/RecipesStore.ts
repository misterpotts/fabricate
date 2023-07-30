import {derived, Readable, Subscriber} from "svelte/store";
import {Recipe} from "../../scripts/crafting/recipe/Recipe";
import {FabricateAPI} from "../../scripts/api/FabricateAPI";
import {CraftingSystem} from "../../scripts/system/CraftingSystem";

class RecipesStore {

    private readonly _recipes: Readable<Recipe[]>;
    private readonly _fabricateAPI: FabricateAPI;

    constructor({
        fabricateAPI,
        selectedCraftingSystem,
    }: {
        fabricateAPI: FabricateAPI;
        selectedCraftingSystem: Readable<CraftingSystem>;
    }) {
        this._fabricateAPI = fabricateAPI;
        this._recipes = derived(
            selectedCraftingSystem,
            ($selectedCraftingSystem, set) => {
                if (!$selectedCraftingSystem) {
                    set([]);
                    return;
                }
                this._fabricateAPI.recipes.getAllByCraftingSystemId($selectedCraftingSystem.id)
                    .then((recipes) => {
                        set(Array.from(recipes.values()));
                    });
            });
    }

    public subscribe(subscriber: Subscriber<Recipe[]>) {
        return this._recipes.subscribe(subscriber);
    }

}

export { RecipesStore }