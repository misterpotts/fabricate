import {get, Readable, Subscriber, Updater, writable, Writable} from "svelte/store";
import {Recipe} from "../../scripts/crafting/recipe/Recipe";
import {FabricateAPI} from "../../scripts/api/FabricateAPI";
import {DefaultCraftingSystem} from "../../scripts/system/CraftingSystem";

class RecipesStore {

    private readonly _recipes: Writable<Recipe[]>;
    private readonly _fabricateAPI: FabricateAPI;

    constructor({
        fabricateAPI,
        selectedCraftingSystem,
        initialValue = [],
    }: {
        fabricateAPI: FabricateAPI;
        selectedCraftingSystem: Readable<DefaultCraftingSystem>;
        initialValue?: Recipe[];
    }) {
        this._fabricateAPI = fabricateAPI;
        this._recipes = writable(initialValue);
        this.watchSelectedCraftingSystem(selectedCraftingSystem);
    }

    private watchSelectedCraftingSystem(selectedCraftingSystem: Readable<DefaultCraftingSystem>) {
        selectedCraftingSystem.subscribe((craftingSystem) => {
            if (!craftingSystem) {
                this._recipes.set([]);
                return;
            }
            this._fabricateAPI.recipes.getAllByCraftingSystemId(craftingSystem.id)
                .then((recipes) => {
                    this._recipes.set(Array.from(recipes.values()));
                });
        });
    }

    public get(): Recipe[] {
        return get(this._recipes);
    }

    public subscribe(subscriber: Subscriber<Recipe[]>) {
        return this._recipes.subscribe(subscriber);
    }

    update(updater: Updater<Recipe[]>): void {
        this._recipes.update(updater);
    }

    insert(recipe: Recipe) {
        this._recipes.update((recipes) => {
            const index = recipes.findIndex((candidate) => candidate.id === recipe.id);
            if (index === -1) {
                recipes.push(recipe);
                return recipes;
            }
            recipes.splice(index, 1, recipe);
            return recipes;
        });
    }

    remove(recipe: Recipe) {
        this._recipes.update((recipes) => {
            const index = recipes.findIndex((candidate) => candidate.id === recipe.id);
            if (index === -1) {
                return recipes;
            }
            recipes.splice(index, 1);
            return recipes;
        });
    }

}

export { RecipesStore }