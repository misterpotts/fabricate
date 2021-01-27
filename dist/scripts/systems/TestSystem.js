import { CraftingSystem } from "../core/CraftingSystem";
import { DefaultFabricator } from "../core/Fabricator";
import { Recipe } from "../core/Recipe";
import { CraftingResult } from "../core/CraftingResult";
import { RecipeComponent } from "../core/RecipeComponent";
import { CraftingElement } from "../core/CraftingElement";
const testSystemCompendiumKey = 'fabricate.fabricate-test';
const TestSystem = CraftingSystem.builder()
    .withName('Test System')
    .withCompendiumPackKey(testSystemCompendiumKey)
    .withSupportedGameSystem('dnd5e')
    .withFabricator(new DefaultFabricator())
    .withRecipe(Recipe.builder()
    .withName('Recipe: Mud Pie')
    .withItemId('4iHqWSLTMFjPbpuI')
    .withComponent(RecipeComponent.builder()
    .isConsumed(true)
    .withQuantity(2)
    .withIngredient(CraftingElement.builder()
    .withName('Mud')
    .withCompendiumEntry(testSystemCompendiumKey, 'tCmAnq9zcESt0ULf')
    .build())
    .build())
    .withComponent(RecipeComponent.builder()
    .isConsumed(true)
    .withQuantity(1)
    .withIngredient(CraftingElement.builder()
    .withName('Sticks')
    .withCompendiumEntry(testSystemCompendiumKey, 'arWeEYkLkubimBz3')
    .build())
    .build())
    .withResult(CraftingResult.builder()
    .withQuantity(1)
    .withItem(CraftingElement.builder()
    .withName('Mud Pie')
    .withCompendiumEntry(testSystemCompendiumKey, 'nWhTa8gD1QL1f9O3')
    .build())
    .build())
    .build())
    .build();
export { TestSystem as default };
