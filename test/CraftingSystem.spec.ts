import {expect} from 'chai';
import * as sinon from 'sinon';

import {CraftingSystem} from "../src/scripts/core/CraftingSystem";
import {Recipe} from "../src/scripts/core/Recipe";
import {RecipeComponent} from "../src/scripts/core/RecipeComponent";
import {CraftingElement} from "../src/scripts/core/CraftingElement";
import {CraftingResult} from "../src/scripts/core/CraftingResult";
import {Fabricator} from '../src/scripts/core/Fabricator';
import {Action} from "../src/scripts/core/Action";

describe('Crafting System |', () => {
    describe('Create |', () => {
        it('Should create a Crafting System', () => {
            let mockFabricator = <Fabricator>{
                fabricate(recipe: Recipe): CraftingResult[] {
                    return null;
                }
            };
            sinon.stub(mockFabricator, "fabricate").returns([]);

            let compendiumKey = 'fabricate.fabricate-test';
            let testSystem = CraftingSystem.builder()
                .withName('Test System')
                .withCompendiumPackKey(compendiumKey)
                .withSupportedGameSystem('dnd5e')
                .withFabricator(mockFabricator)
                .withRecipe(Recipe.builder()
                    .withName('Recipe: Mud Pie')
                    .withItemId('4iHqWSLTMFjPbpuI')
                    .withComponent(RecipeComponent.builder()
                        .isConsumed(true)
                        .withQuantity(2)
                        .withIngredient(CraftingElement.builder()
                            .withName('Mud')
                            .withCompendiumEntry(compendiumKey, 'tCmAnq9zcESt0ULf')
                            .build())
                        .build())
                    .withComponent(RecipeComponent.builder()
                        .isConsumed(true)
                        .withQuantity(1)
                        .withIngredient(CraftingElement.builder()
                            .withName('Sticks')
                            .withCompendiumEntry(compendiumKey, 'arWeEYkLkubimBz3')
                            .build())
                        .build())
                    .withResult(CraftingResult.builder()
                        .withAction(Action.ADD)
                        .withQuantity(1)
                        .withItem(CraftingElement.builder()
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
                        { _ingredient: { _name: 'Mud',_compendiumEntry: { _compendiumKey: 'fabricate.fabricate-test', _itemId: 'tCmAnq9zcESt0ULf' } }, _quantity: 2, _consumed: true },
                        { _ingredient: { _name: 'Sticks',_compendiumEntry: { _compendiumKey: 'fabricate.fabricate-test', _itemId: 'arWeEYkLkubimBz3' } }, _quantity: 1, _consumed: true }
                    ],
                    _results: [
                        { _action: 'ADD', _item: { _name: 'Mud Pie', "_compendiumEntry": { _compendiumKey: 'fabricate.fabricate-test', _itemId: 'nWhTa8gD1QL1f9O3' } }, _quantity : 1 }
                    ],
                }
            ]);
        });
    });
    describe('Craft |', () => {
        it('Should delegate crafting to the system\'s Fabricator', () => {
            let compendiumKey = 'fabricate.fabricate-test';
            let recipeResult = CraftingResult.builder()
                .withQuantity(1)
                .withItem(CraftingElement.builder()
                    .withName('Mud Pie')
                    .withCompendiumEntry(compendiumKey, 'nWhTa8gD1QL1f9O3')
                    .build())
                .build();

            let mockFabricator = <Fabricator>{
                fabricate(recipe: Recipe): CraftingResult[] {
                    return null;
                }
            };
            sinon.stub(mockFabricator, 'fabricate').returns([recipeResult.item]);

            let testRecipe = Recipe.builder()
                .withName('Recipe: Mud Pie')
                .withItemId('4iHqWSLTMFjPbpuI')
                .withComponent(RecipeComponent.builder()
                    .isConsumed(true)
                    .withQuantity(2)
                    .withIngredient(CraftingElement.builder()
                        .withName('Mud')
                        .withCompendiumEntry(compendiumKey, 'tCmAnq9zcESt0ULf')
                        .build())
                    .build())
                .withComponent(RecipeComponent.builder()
                    .isConsumed(true)
                    .withQuantity(1)
                    .withIngredient(CraftingElement.builder()
                        .withName('Sticks')
                        .withCompendiumEntry(compendiumKey, 'arWeEYkLkubimBz3')
                        .build())
                    .build())
                .withResult(recipeResult)
                .build();
            let testSystem = CraftingSystem.builder()
                .withName('Test System')
                .withCompendiumPackKey(compendiumKey)
                .withSupportedGameSystem('dnd5e')
                .withFabricator(mockFabricator)
                .withRecipe(testRecipe)
                .build();

            let stubActor: Actor = <Actor>{
                data: {
                    items: []
                }
            };
            testSystem.craft(stubActor, testRecipe);
        });
    })
});