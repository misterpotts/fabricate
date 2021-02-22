import {expect} from 'chai';
import * as Sinon from 'sinon';
import {Fabricator} from "../src/scripts/core/Fabricator";
import {Recipe} from "../src/scripts/core/Recipe";
import {CraftingResult} from "../src/scripts/core/CraftingResult";
import {CraftingSystem} from "../src/scripts/core/CraftingSystem";
import {Ingredient} from "../src/scripts/core/Ingredient";
import {CraftingComponent} from "../src/scripts/core/CraftingComponent";
import {ActionType} from "../src/scripts/core/ActionType";
import {CraftingSystemRegistry} from "../src/scripts/registries/CraftingSystemRegistry";

describe('Crafting System Registry |', () => {

    describe('Register and Retrieve |', () => {

        let mockFabricator = <Fabricator>{
            fabricateFromRecipe(recipe: Recipe): CraftingResult[] {
                return recipe.results;
            },
            fabricateFromComponents(): CraftingResult[] {
                // @ts-ignore
                return [];
            }
        };
        Sinon.stub(mockFabricator, "fabricateFromRecipe").returns([]);

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
                    .withPartId(mudPieRecipeId)
                    .withIngredient(Ingredient.builder()
                        .isConsumed(true)
                        .withQuantity(2)
                        .withComponent(CraftingComponent.builder()
                            .withName('Mud')
                            .withPartId('tCmAnq9zcESt0ULf')
                            .withSystemId(testSystemCompendiumKey)
                            .build())
                        .build())
                    .withIngredient(Ingredient.builder()
                        .isConsumed(true)
                        .withQuantity(1)
                        .withComponent(CraftingComponent.builder()
                            .withName('Sticks')
                            .withPartId('arWeEYkLkubimBz3')
                            .withSystemId(testSystemCompendiumKey)
                            .build())
                        .build())
                    .withResult(CraftingResult.builder()
                        .withAction(ActionType.ADD)
                        .withQuantity(1)
                        .withItem(CraftingComponent.builder()
                            .withName('Mud Pie')
                            .withPartId('nWhTa8gD1QL1f9O3')
                            .withSystemId(testSystemCompendiumKey)
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