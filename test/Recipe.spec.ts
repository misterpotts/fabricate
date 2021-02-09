import { expect } from 'chai';
import {Recipe} from "../src/scripts/core/Recipe";
import {CraftingComponent} from "../src/scripts/core/CraftingComponent";
import {Ingredient} from "../src/scripts/core/Ingredient";
import {CraftingResult} from "../src/scripts/core/CraftingResult";
import {FabricateCompendiumData} from "../src/scripts/core/CompendiumData";
import {ActionType} from "../src/scripts/core/ActionType";

describe('Recipe |', () => {
    describe('Create |', () => {
        it('Should create a Recipe', () => {
            const testRecipe = Recipe.builder()
                .withName('Simple mud pie recipe')
                .withEntryId('4')
                .withIngredient(Ingredient.builder()
                    .withComponentType(CraftingComponent.builder()
                        .withName('Mud')
                        .withCompendiumEntry('compendium', '1')
                        .build())
                    .withQuantity(2)
                    .isConsumed(true)
                    .build())
                .withIngredient(Ingredient.builder()
                    .withComponentType(CraftingComponent.builder()
                        .withName('Sticks')
                        .withCompendiumEntry('compendium', '2')
                        .build())
                    .withQuantity(1)
                    .isConsumed(true)
                    .build())
                .withResult(CraftingResult.builder()
                    .withQuantity(1)
                    .withItem(CraftingComponent.builder()
                        .withName('Mud Pie')
                        .withCompendiumEntry('compendium', '3')
                        .build())
                    .build())
                .build();

            expect(testRecipe.name).to.equal('Simple mud pie recipe');
            expect(testRecipe.ingredients.length).to.equal(2);
            expect(testRecipe.entryId).to.equal('4');
            expect(testRecipe.ingredients).to.deep.include.members([
                { _componentType: { _name: 'Mud', _essences: [], _compendiumEntry: { _compendiumKey: 'compendium', _entryId: '1' } }, _quantity: 2, _consumed: true },
                { _componentType: { _name: 'Sticks', _essences: [], _compendiumEntry: { _compendiumKey: 'compendium', _entryId: '2' } }, _quantity: 1, _consumed: true }
            ]);
        });

        it('Should create a Recipe using Ingredients from flags', () => {

            const recipeFlagData: FabricateCompendiumData = <FabricateCompendiumData>{
                type: "RECIPE",
                recipe: {
                    entryId: '4iHqWSLTMFjPbpuI',
                    name: 'Recipe: Mud Pie',
                    essences: [],
                    ingredients: [
                        {
                            componentType: {
                                name: 'Mud',
                                compendiumEntry: {
                                    compendiumKey: 'fabricate.fabricate-test',
                                    entryId: 'tCmAnq9zcESt0ULf'
                                }
                            },
                            quantity: 2,
                            consumed: true
                        },
                        {
                            componentType: {
                                name: 'Sticks',
                                compendiumEntry: {
                                    compendiumKey: 'fabricate.fabricate-test',
                                    entryId: 'arWeEYkLkubimBz3'
                                }
                            },
                            quantity: 1,
                            consumed: true
                        }
                    ],
                    results: [
                        {
                            action: "ADD",
                            item: {
                                name: 'Mud Pie',
                                compendiumEntry: {
                                    compendiumKey: 'fabricate.fabricate-test',
                                    entryId: 'nWhTa8gD1QL1f9O3'
                                }
                            },
                            quantity: 1
                        }
                    ]
                }
            };
            const underTest = Recipe.fromFlags(recipeFlagData);
            expect(underTest.name).to.equal('Recipe: Mud Pie');
            expect(underTest.entryId).to.equal('4iHqWSLTMFjPbpuI');
            expect(underTest.ingredients.length).to.equal(2);
            const twoMudConsumed = Ingredient.builder()
                .isConsumed(true)
                .withQuantity(2)
                .withComponentType(CraftingComponent.builder()
                    .withName('Mud')
                    .withCompendiumEntry('fabricate.fabricate-test', 'tCmAnq9zcESt0ULf')
                    .build())
                .build();
            expect(twoMudConsumed.is(underTest.ingredients[0])).to.be.true;
            const oneSticksConsumed = Ingredient.builder()
                .isConsumed(true)
                .withQuantity(1)
                .withComponentType(CraftingComponent.builder()
                    .withName('Sticks')
                    .withCompendiumEntry('fabricate.fabricate-test', 'arWeEYkLkubimBz3')
                    .build())
                .build();
            expect(oneSticksConsumed.is(underTest.ingredients[1])).to.be.true;
            expect(underTest.results.length).to.equal(1);
            expect(underTest.results[0].quantity).to.equal(1);
            expect(underTest.results[0].action).to.equal(ActionType.ADD);
            const mudPie = CraftingComponent.builder()
                .withName('Mud Pie')
                .withCompendiumEntry('fabricate.fabricate-test', 'nWhTa8gD1QL1f9O3')
                .build();
            expect(underTest.results[0].item.equals(mudPie)).to.be.true;
        });
    });
});