import {expect} from 'chai';
import * as sinon from 'sinon';

import {CraftingSystem} from "../src/scripts/core/CraftingSystem";
import {Recipe} from "../src/scripts/core/Recipe";
import {RecipeComponent} from "../src/scripts/core/RecipeComponent";
import {CraftingElement} from "../src/scripts/core/CraftingElement";
import {RecipeResult} from "../src/scripts/core/RecipeResult";
import {Fabricator} from '../src/scripts/core/Fabricator';

describe('Crafting System |', () => {
    describe('Create |', () => {
        it('Should create a Crafting System', () => {
            let mockFabricator = <Fabricator>{
                fabricate(recipe: Recipe): RecipeResult[] {
                    return null;
                }
            };
            sinon.stub(mockFabricator, "fabricate").returns([]);

            let testSystem = CraftingSystem.builder()
                .withName('Test System')
                .withCompendiumPackKey('fabricate.fabricate-test')
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

            expect(testSystem.name).to.equal('Test System');
            expect(testSystem.compendiumPackKey).to.equal('fabricate.fabricate-test');
            expect(testSystem.supportedGameSystems).to.contain('dnd5e');
            expect(testSystem.recipes.length).to.equal(1);
            expect(testSystem.recipes).to.deep.include.members([
                {
                    _name: 'Recipe: Mud Pie',
                    _itemId: '4iHqWSLTMFjPbpuI',
                    _components: [
                        { _ingredient: { _name: 'Mud', _itemId: 'tCmAnq9zcESt0ULf' }, _quantity: 2, _consumed: true },
                        { _ingredient: { _name: 'Sticks', _itemId: 'arWeEYkLkubimBz3' }, _quantity: 1, _consumed: true },
                    ],
                    _results: [
                        { _item: { _name: 'Mud Pie', _itemId: 'nWhTa8gD1QL1f9O3' }, _quantity : 1 }
                    ],
                }
            ]);
        });

        it('Should delegate crafting to the system\'s Fabricator', () => {
            let recipeResult = RecipeResult.builder()
                .withQuantity(1)
                .withItem(CraftingElement.builder()
                    .withName('Mud Pie')
                    .withItemId('nWhTa8gD1QL1f9O3')
                    .build())
                .build();

            let mockFabricator = <Fabricator>{
                fabricate(recipe: Recipe): RecipeResult[] {
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
                .withResult(recipeResult)
                .build();
            let testSystem = CraftingSystem.builder()
                .withName('Test System')
                .withCompendiumPackKey('fabricate.fabricate-test')
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
        } );
    });
});