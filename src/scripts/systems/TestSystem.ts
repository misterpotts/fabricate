import {CraftingSystem} from "../core/CraftingSystem.js";
import {Fabricator} from "../core/Fabricator.js";
import {Recipe} from "../core/Recipe.js";
import {RecipeResult} from "../core/RecipeResult.js";
import {RecipeComponent} from "../core/RecipeComponent.js";
import {CraftingElement} from "../core/CraftingElement.js";

class TestSystemFabricator implements Fabricator {
    fabricate(recipe: Recipe): RecipeResult[] {
        return recipe.results;
    }
}

const TestSystem = CraftingSystem.builder()
    .withName('Test System')
    .withCompendiumPackKey('fabricate.fabricate-test')
    .withSupportedGameSystem('dnd5e')
    .withFabricator(new TestSystemFabricator())
    .withRecipe(Recipe.builder()
        .withName('Recipe: Mud Pie')
        .withItemId('4iHqWSLTMFjPbpuI')
        .withComponent(RecipeComponent.builder()
            .isConsumed(true)
            .withQuantity(2)
            .withIngredient(CraftingElement.builder()
                .withName('Mud')
                .withItemId('tCmAnq9zcESt0ULf')
                .build())
            .build())
        .withComponent(RecipeComponent.builder()
            .isConsumed(true)
            .withQuantity(1)
            .withIngredient(CraftingElement.builder()
                .withName('Sticks')
                .withItemId('arWeEYkLkubimBz3')
                .build())
            .build())
        .withResult(RecipeResult.builder()
            .withQuantity(1)
            .withItem(CraftingElement.builder()
                .withName('Mud Pie')
                .withItemId('nWhTa8gD1QL1f9O3')
                .build())
            .build())
        .build())
    .build();

export {TestSystem as default};