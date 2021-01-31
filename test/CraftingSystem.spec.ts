import {expect} from 'chai';
import * as Sinon from 'sinon';

import {CraftingSystem} from "../src/scripts/core/CraftingSystem";
import {Recipe} from "../src/scripts/core/Recipe";
import {Ingredient} from "../src/scripts/core/Ingredient";
import {CraftingComponent} from "../src/scripts/core/CraftingComponent";
import {CraftingResult} from "../src/scripts/core/CraftingResult";
import {Fabricator} from '../src/scripts/core/Fabricator';
import {ActionType} from "../src/scripts/core/ActionType";

describe('Crafting System |', () => {
    describe('Create |', () => {
        it('Should create a Crafting System', () => {
            let mockFabricator = <Fabricator>{
                fabricate(recipe: Recipe): CraftingResult[] {
                    return recipe.results;
                }
            };
            Sinon.stub(mockFabricator, "fabricate").returns([]);

            let compendiumKey = 'fabricate.fabricate-test';
            let testSystem = CraftingSystem.builder()
                .withName('Test System')
                .withCompendiumPackKey(compendiumKey)
                .withSupportedGameSystem('dnd5e')
                .withFabricator(mockFabricator)
                .withRecipe(Recipe.builder()
                    .withName('Recipe: Mud Pie')
                    .withItemId('4iHqWSLTMFjPbpuI')
                    .withComponent(Ingredient.builder()
                        .isConsumed(true)
                        .withQuantity(2)
                        .withIngredient(CraftingComponent.builder()
                            .withName('Mud')
                            .withCompendiumEntry(compendiumKey, 'tCmAnq9zcESt0ULf')
                            .build())
                        .build())
                    .withComponent(Ingredient.builder()
                        .isConsumed(true)
                        .withQuantity(1)
                        .withIngredient(CraftingComponent.builder()
                            .withName('Sticks')
                            .withCompendiumEntry(compendiumKey, 'arWeEYkLkubimBz3')
                            .build())
                        .build())
                    .withResult(CraftingResult.builder()
                        .withAction(ActionType.ADD)
                        .withQuantity(1)
                        .withItem(CraftingComponent.builder()
                            .withName('Mud Pie')
                            .withCompendiumEntry(compendiumKey, 'nWhTa8gD1QL1f9O3')
                            .build())
                        .build())
                    .build())
                .build();

            expect(testSystem.name).to.equal('Test System');
            expect(testSystem.compendiumPackKey).to.equal('fabricate.fabricate-test');
            expect(testSystem.supportedGameSystems).to.contain('dnd5e');
            expect(testSystem.recipes.length).to.equal(1);
            expect(testSystem.recipes).to.deep.include.members([
                {
                    _name: 'Recipe: Mud Pie',
                    _itemId: '4iHqWSLTMFjPbpuI',
                    _components: [
                        { _componentType: { _name: 'Mud', _compendiumEntry: { _compendiumKey: 'fabricate.fabricate-test', _entryId: 'tCmAnq9zcESt0ULf' } }, _quantity: 2, _consumed: true },
                        { _componentType: { _name: 'Sticks', _compendiumEntry: { _compendiumKey: 'fabricate.fabricate-test', _entryId: 'arWeEYkLkubimBz3' } }, _quantity: 1, _consumed: true }
                    ],
                    _results: [
                        { _action: 'ADD', _item: { _name: 'Mud Pie', "_compendiumEntry": { _compendiumKey: 'fabricate.fabricate-test', _entryId: 'nWhTa8gD1QL1f9O3' } }, _quantity : 1 }
                    ],
                }
            ]);
        });
    });
    describe('Craft |', () => {
        it('Should delegate crafting to the system\'s Fabricator', () => {
            // let compendiumKey = 'fabricate.fabricate-test';
            // let recipeResult = CraftingResult.builder()
            //     .withQuantity(1)
            //     .withItem(CraftingComponent.builder()
            //         .withName('Mud Pie')
            //         .withCompendiumEntry(compendiumKey, 'nWhTa8gD1QL1f9O3')
            //         .build())
            //     .build();
            //
            // let mockFabricator = <Fabricator>{
            //     fabricate(recipe: Recipe): CraftingResult[] {
            //         return recipe.results;
            //     }
            // };
            // Sinon.stub(mockFabricator, 'fabricate').returns([]);
            //
            // let testRecipe = Recipe.builder()
            //     .withName('Recipe: Mud Pie')
            //     .withItemId('4iHqWSLTMFjPbpuI')
            //     .withComponent(Ingredient.builder()
            //         .isConsumed(true)
            //         .withQuantity(2)
            //         .withIngredient(CraftingComponent.builder()
            //             .withName('Mud')
            //             .withCompendiumEntry(compendiumKey, 'tCmAnq9zcESt0ULf')
            //             .build())
            //         .build())
            //     .withComponent(Ingredient.builder()
            //         .isConsumed(true)
            //         .withQuantity(1)
            //         .withIngredient(CraftingComponent.builder()
            //             .withName('Sticks')
            //             .withCompendiumEntry(compendiumKey, 'arWeEYkLkubimBz3')
            //             .build())
            //         .build())
            //     .withResult(recipeResult)
            //     .build();
            // let testSystem = CraftingSystem.builder()
            //     .withName('Test System')
            //     .withCompendiumPackKey(compendiumKey)
            //     .withSupportedGameSystem('dnd5e')
            //     .withFabricator(mockFabricator)
            //     .withRecipe(testRecipe)
            //     .build();
            //
            // let stubActor: Actor = <Actor>{
            //     data: {
            //         items: []
            //     }
            // };
            // todo: figure out how to test and mock the global game object
        });
    })
});