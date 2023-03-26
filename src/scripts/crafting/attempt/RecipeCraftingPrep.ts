import {Recipe} from "../recipe/Recipe";
import {CraftingAttempt} from "./CraftingAttempt";

interface RecipeCraftingPrep {

    recipe: Recipe;
    isSingleton: boolean;
    getCraftingAttemptByIngredientOptionName(optionName: string): CraftingAttempt;
    getAllCraftingAttempts(): CraftingAttempt[];
    getSingletonCraftingAttempt(): CraftingAttempt;

}

export { RecipeCraftingPrep }

class MultipleRecipeCraftingPrep implements RecipeCraftingPrep {

    private readonly _recipe: Recipe;
    private readonly _craftingAttemptsByIngredientOptionName: Map<string, CraftingAttempt>;

    constructor({
        recipe,
        craftingAttemptsByIngredientOptionName = new Map()
    }: {
        recipe: Recipe;
        craftingAttemptsByIngredientOptionName?: Map<string, CraftingAttempt>;
    }) {
        this._recipe = recipe;
        this._craftingAttemptsByIngredientOptionName = craftingAttemptsByIngredientOptionName;
    }

    get isSingleton(): boolean {
        return false;
    }

    get recipe(): Recipe {
        return this._recipe;
    }

    getAllCraftingAttempts(): CraftingAttempt[] {
        return Array.from(this._craftingAttemptsByIngredientOptionName.values());
    }

    getCraftingAttemptByIngredientOptionName(optionName: string): CraftingAttempt {
        if (!this._craftingAttemptsByIngredientOptionName.has(optionName)) {
            throw new Error(`The ingredient option with the name ${optionName} has no prepared crafting attempt. `);
        }
        return this._craftingAttemptsByIngredientOptionName.get(optionName);
    }

    getSingletonCraftingAttempt(): CraftingAttempt {
        throw new Error(`The recipe "${this._recipe.name}" has no singleton crafting attempt. It has ${this._craftingAttemptsByIngredientOptionName.size} ingredient options. `);
    }

}

export { MultipleRecipeCraftingPrep }

class SingletonRecipeCraftingPrep implements RecipeCraftingPrep {

    private readonly _recipe: Recipe;
    private readonly _singletonCraftingAttempt: CraftingAttempt;

    constructor({
        recipe,
        singletonCraftingAttempt
    }: {
        recipe: Recipe;
        singletonCraftingAttempt: CraftingAttempt;
    }) {
        this._recipe = recipe;
        this._singletonCraftingAttempt = singletonCraftingAttempt;
    }

    get isSingleton(): boolean {
        return true;
    }

    get recipe(): Recipe {
        return this._recipe;
    }

    getAllCraftingAttempts(): CraftingAttempt[] {
        throw new Error(`Cannot get multiple crafting attempts. The Recipe "${this._recipe.name}" has no ingredient options.`);
    }

    getCraftingAttemptByIngredientOptionName(optionName: string): CraftingAttempt {
        throw new Error(`Cannot get the crafting attempts for the ingredient option ${optionName}. The Recipe "${this._recipe.name}" has no ingredient options.`);
    }

    getSingletonCraftingAttempt(): CraftingAttempt {
        return this._singletonCraftingAttempt;
    }

}

export { SingletonRecipeCraftingPrep }