import {Recipe} from "./Recipe.js";
import {RecipeResult} from "./RecipeResult.js";

interface Fabricator {
    fabricate(recipe: Recipe): RecipeResult[];
}

export {Fabricator};