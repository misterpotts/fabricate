import {ComponentSearch} from "./ComponentSearch";
import {Combination} from "../common/Combination";
import {CraftingComponent} from "../common/CraftingComponent";

export class IngredientSearch implements ComponentSearch {

    private readonly _ingredients: Combination<CraftingComponent>;

    constructor(ingredients: Combination<CraftingComponent>) {
        this._ingredients = ingredients;
    }

    public perform(contents: Combination<CraftingComponent>): boolean {
        return this._ingredients.isIn(contents);
    }

}