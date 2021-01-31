import {expect} from 'chai';
import * as Sinon from 'sinon';
import {Fabricator} from "../src/scripts/core/Fabricator";
import {Recipe} from "../src/scripts/core/Recipe";
import {CraftingResult} from "../src/scripts/core/CraftingResult";
import {CraftingSystem} from "../src/scripts/core/CraftingSystem";
import {Ingredient} from "../src/scripts/core/Ingredient";
import {CraftingComponent} from "../src/scripts/core/CraftingComponent";
import {ActionType} from "../src/scripts/core/ActionType";
import {CraftingSystemRegistry} from "../src/scripts/systems/CraftingSystemRegistry";

describe('Crafting System Registry |', () => {

    describe('Register and Retrieve |', () => {

        let mockFabricator = <Fabricator>{
            fabricate(recipe: Recipe): CraftingResult[] {
                return recipe.results;
            }
        };
        Sinon.stub(mockFabricator, "fabricate").returns([]);

        let testSystemCompendiumKey = 'fabricate.fabricate-test';
        let mudPieRecipeId = '4iHqWSLTMFjPbpuI';
        let testSystemName = 'Test System';
        let testSystem = CraftingSystem.builder()
                .withName(testSystemName)
                .withCompendiumPackKey(testSystemCompendiumKey)
                .withSupportedGameSystem('dnd5e')
                .withFabricator(mockFabricator)
                .withRecipe(Recipe.builder()
                    .withName('Recipe: Mud Pie')
                    .withItemId(mudPieRecipeId)
                    .withComponent(Ingredient.builder()
                        .isConsumed(true)
                        .withQuantity(2)
                        .withIngredient(CraftingComponent.builder()
                            .withName('Mud')
                            .withCompendiumEntry(testSystemCompendiumKey, 'tCmAnq9zcESt0ULf')
                            .build())
                        .build())
                    .withComponent(Ingredient.builder()
                        .isConsumed(true)
                        .withQuantity(1)
                        .withIngredient(CraftingComponent.builder()
                            .withName('Sticks')
                            .withCompendiumEntry(testSystemCompendiumKey, 'arWeEYkLkubimBz3')
                            .build())
                        .build())
                    .withResult(CraftingResult.builder()
                        .withAction(ActionType.ADD)
                        .withQuantity(1)
                        .withItem(CraftingComponent.builder()
                            .withName('Mud Pie')
                            .withCompendiumEntry(testSystemCompendiumKey, 'nWhTa8gD1QL1f9O3')
                            .build())
                        .build())
                    .build())
                .build();

        it('Should register a Crafting System and retrieve by Recipe ID', () => {

            CraftingSystemRegistry.register(testSystem);
            let testSystemRef = CraftingSystemRegistry.getSystemByRecipeId(mudPieRecipeId);
            expect(testSystemRef.compendiumPackKey).to.equal(testSystemCompendiumKey);
            expect(testSystem.recipes.length).to.equal(1);

        });

        it('Should register a Crafting System and retrieve by Compendium Key', () => {

            CraftingSystemRegistry.register(testSystem);
            let testSystemRef = CraftingSystemRegistry.getSystemByCompendiumPackKey(testSystemCompendiumKey);
            expect(testSystemRef.name).to.equal(testSystemName);
            expect(testSystem.recipes.length).to.equal(1);

        });

    });
});