import {get, Readable, Subscriber, Updater, writable, Writable} from "svelte/store";
import {Recipe} from "../../scripts/common/Recipe";

class SelectedRecipeStore {

    private readonly _selectedRecipe: Writable<Recipe>;

    constructor({
        recipes,
        selectedRecipe
    }: {
        recipes: Readable<Recipe[]>;
        selectedRecipe?: Recipe;
    }) {
        this._selectedRecipe = writable(selectedRecipe);
        this.deselectWhenRecipeNotInAvailableRecipes(recipes);
    }

    private deselectWhenRecipeNotInAvailableRecipes(recipes: Readable<Recipe[]>) {
        recipes.subscribe(value => {
            if (!value) {
                throw new Error("Recipes may not be null");
            }
            if (value.length === 0) {
                this._selectedRecipe.set(null);
            }
            const selectedRecipe = get(this._selectedRecipe);
            const found = value.find(recipe => recipe === selectedRecipe);
            if (!found) {
                this._selectedRecipe.set(null);
            }
        });
    }

    public subscribe(subscriber: Subscriber<Recipe>) {
        return this._selectedRecipe.subscribe(subscriber);
    }

    public set(value: Recipe) {
        return this._selectedRecipe.set(value);
    }

    public update(updater: Updater<Recipe>) {
        this._selectedRecipe.update(updater);
    }

}

export { SelectedRecipeStore }