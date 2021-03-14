import {expect} from 'chai';
import {Recipe} from "../src/scripts/core/Recipe";
import {CraftingComponent} from "../src/scripts/core/CraftingComponent";
import {Ingredient} from "../src/scripts/core/Ingredient";
import {FabricationAction, FabricationActionType} from "../src/scripts/core/FabricationAction";
import {FabricateCompendiumData} from "../src/scripts/game/CompendiumData";

describe('Recipe |', () => {

    describe('Create |', () => {

        it('Should create a Recipe', () => {

            const testRecipe = Recipe.builder()
                .withName('Simple mud pie recipe')
                .withPartId('4')
                .withIngredient(Ingredient.builder()
                    .withComponent(CraftingComponent.builder()
                        .withName('Mud')
                        .withPartId('1')
                        .withSystemId('compendium')
                        .build())
                    .withQuantity(2)
                    .isConsumed(true)
                    .build())
                .withIngredient(Ingredient.builder()
                    .withComponent(CraftingComponent.builder()
                        .withName('Sticks')
                        .withPartId('2')
                        .withSystemId('compendium')
                        .build())
                    .withQuantity(1)
                    .isConsumed(true)
                    .build())
                .withResult(FabricationAction.builder()
                    .withQuantity(1)
                    .withComponent(CraftingComponent.builder()
                        .withName('Mud Pie')
                        .withPartId('3')
                        .withSystemId('compendium')
                        .build())
                    .build())
                .build();

            expect(testRecipe.name).to.equal('Simple mud pie recipe');
            expect(testRecipe.ingredients.length).to.equal(2);
            expect(testRecipe.partId).to.equal('4');
            expect(testRecipe.ingredients).to.deep.include.members([
                Ingredient.builder()
                    .withQuantity(2)
                    .isConsumed(true)
                    .withComponent(CraftingComponent.builder()
                        .withName('Mud')
                        .withPartId('1')
                        .withSystemId('compendium')
                        .build())
                    .build(),
                Ingredient.builder()
                    .withQuantity(1)
                    .isConsumed(true)
                    .withComponent(CraftingComponent.builder()
                        .withName('Sticks')
                        .withPartId('2')
                        .withSystemId('compendium')
                        .build())
                    .build()
            ]);
        });

        it('Should create a Recipe using Ingredients from flags', () => {

            const recipeFlagData: FabricateCompendiumData = <FabricateCompendiumData>{
                type: "RECIPE",
                identity: {
                    partId: '4iHqWSLTMFjPbpuI',
                    systemId: 'fabricate.fabricate-test'
                },
                recipe: {
                    essences: [],
                    ingredients: [
                        {
                            partId: 'tCmAnq9zcESt0ULf',
                            quantity: 2,
                            consumed: true
                        },
                        {
                            partId: 'arWeEYkLkubimBz3',
                            quantity: 1,
                            consumed: true
                        }
                    ],
                    results: [
                        {
                            action: "ADD",
                            partId: 'nWhTa8gD1QL1f9O3',
                            quantity: 1
                        }
                    ]
                }
            };
            const underTest = Recipe.fromFlags(recipeFlagData, 'Recipe: Mud Pie', '/img/img.jpg');
            expect(underTest.name).to.equal('Recipe: Mud Pie');
            expect(underTest.partId).to.equal('4iHqWSLTMFjPbpuI');
            expect(underTest.ingredients.length).to.equal(2);
            const twoMudConsumed = Ingredient.builder()
                .isConsumed(true)
                .withQuantity(2)
                .withComponent(CraftingComponent.builder()
                    .withName('Mud')
                    .withPartId('tCmAnq9zcESt0ULf')
                    .withSystemId('fabricate.fabricate-test')
                    .build())
                .build();
            expect(twoMudConsumed.equals(underTest.ingredients[0])).to.be.true;
            const oneSticksConsumed = Ingredient.builder()
                .isConsumed(true)
                .withQuantity(1)
                .withComponent(CraftingComponent.builder()
                    .withName('Sticks')
                    .withPartId('arWeEYkLkubimBz3')
                    .withSystemId('fabricate.fabricate-test')
                    .build())
                .build();
            expect(oneSticksConsumed.equals(underTest.ingredients[1])).to.be.true;
            expect(underTest.results.length).to.equal(1);
            expect(underTest.results[0].quantity).to.equal(1);
            expect(underTest.results[0].type).to.equal(FabricationActionType.ADD);
            const mudPie = CraftingComponent.builder()
                .withName('Mud Pie')
                .withPartId('nWhTa8gD1QL1f9O3')
                .withSystemId('fabricate.fabricate-test')
                .build();
            expect(underTest.results[0].component.sharesType(mudPie)).to.be.true;

        });

    });

});