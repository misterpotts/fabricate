import {Recipe} from "./Recipe.js";
import {RecipeResult} from "./RecipeResult.js";

interface Fabricator {
    fabricate(recipe: Recipe): RecipeResult[];
}

class DefaultFabricator implements Fabricator {
    fabricate(recipe: Recipe): RecipeResult[] {
        return recipe.results;
    }
}

export {Fabricator, DefaultFabricator};