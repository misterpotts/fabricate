import {Ingredient} from "./Ingredient.js";

class Recipe {
    private ingredients: Ingredient[];
    private results: Object[];

    constructor(ingredients: Ingredient[], results: Object[]) {
        this.ingredients = ingredients;
        this.results = results;
    }

}

export { Recipe };