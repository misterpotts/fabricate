import {describe, expect, test} from "@jest/globals";
import {RecipeCraftingPrepFactory} from "../src/scripts/crafting/attempt/RecipeCraftingPrepFactory";
import {DefaultComponentSelectionStrategy} from "../src/scripts/crafting/selection/ComponentSelectionStrategy";
import {Combination, Unit} from "../src/scripts/common/Combination";
import {testRecipeFive, testRecipeFour} from "./test_data/TestRecipes";
import {Component} from "../src/scripts/common/Component";
import {TrackedUnit} from "../src/scripts/common/TrackedCombination";
import {elementalEarth, elementalFire, elementalWater} from "./test_data/TestEssences";
import {
    testComponentFour,
    testComponentOne,
    testComponentSix, testComponentThree,
    testComponentTwo
} from "./test_data/TestCraftingComponents";

describe("Create a Crafting Attempt", () => {

    const selectionStrategy = new DefaultComponentSelectionStrategy();

    describe("for a Recipe with one ingredient option", () => {

        test("that cannot be crafted", () => {

            const underTest = new RecipeCraftingPrepFactory({ selectionStrategy });

            const availableComponents = Combination.EMPTY<Component>();

            const result = underTest.make(testRecipeFive, availableComponents);

            expect(result.isSingleton).toEqual(true);

            const craftingAttemptResult = result.getSingletonCraftingAttempt();

            expect(craftingAttemptResult.requiresEssences).toEqual(true);
            expect(craftingAttemptResult.essenceAmounts.isSufficient).toEqual(false);
            expect(craftingAttemptResult.essenceAmounts.deficit).toEqual(2);
            expect(craftingAttemptResult.essenceAmounts.units)
                .toEqual(expect.arrayContaining(
                    [
                            new TrackedUnit({
                                target: new Unit(elementalFire, 1),
                                actual: new Unit(elementalFire, 0)
                            }),
                            new TrackedUnit({
                                target: new Unit(elementalWater, 1),
                                actual: new Unit(elementalWater, 0)
                            })
                        ]
                    )
                );
            expect(craftingAttemptResult.essenceSources.isEmpty()).toEqual(true);

            expect(craftingAttemptResult.requiresIngredients).toEqual(false);
            expect(craftingAttemptResult.ingredientAmounts.isSufficient).toEqual(true);
            expect(craftingAttemptResult.ingredientAmounts.isEmpty).toEqual(true);

            expect(craftingAttemptResult.requiresCatalysts).toEqual(true);
            expect(craftingAttemptResult.catalystAmounts.isSufficient).toEqual(false);
            expect(craftingAttemptResult.catalystAmounts.units)
                .toEqual(expect.arrayContaining(
                        [
                            new TrackedUnit({
                                target: new Unit(testComponentFour, 1),
                                actual: new Unit(testComponentFour, 0)
                            })
                        ]
                    )
                );

        });

        test("that can be crafted", () => {

            const underTest = new RecipeCraftingPrepFactory({ selectionStrategy });

            const availableComponents = testRecipeFour.getSelectedIngredients().ingredients
                .combineWith(testRecipeFour.getSelectedIngredients().catalysts)
                .combineWith(Combination.ofUnits([
                    new Unit(testComponentOne, 1),
                    new Unit(testComponentSix, 2)
                ]));

            const result = underTest.make(testRecipeFour, availableComponents);

            expect(result.isSingleton).toEqual(true);

            const craftingAttemptResult = result.getSingletonCraftingAttempt();

            expect(craftingAttemptResult.requiresEssences).toEqual(true);
            expect(craftingAttemptResult.essenceAmounts.isSufficient).toEqual(true);
            expect(craftingAttemptResult.essenceAmounts.isEmpty).toEqual(false);
            expect(craftingAttemptResult.essenceAmounts.deficit).toEqual(0);
            expect(craftingAttemptResult.essenceAmounts.units)
                .toEqual(expect.arrayContaining(
                        [
                            new TrackedUnit({
                                target: new Unit(elementalEarth, 1),
                                actual: new Unit(elementalEarth, 2)
                            }),
                            new TrackedUnit({
                                target: new Unit(elementalWater, 2),
                                actual: new Unit(elementalWater, 2)
                            })
                        ]
                    )
                );
            expect(craftingAttemptResult.essenceSources.units)
                .toEqual(expect.arrayContaining(
                        [
                            new Unit(testComponentOne, 1),
                            new Unit(testComponentSix, 2),
                        ]
                    )
                );

            expect(craftingAttemptResult.requiresIngredients).toEqual(true);
            expect(craftingAttemptResult.ingredientAmounts.isSufficient).toEqual(true);
            expect(craftingAttemptResult.ingredientAmounts.isEmpty).toEqual(false);
            expect(craftingAttemptResult.ingredientAmounts.deficit).toEqual(0);
            expect(craftingAttemptResult.ingredientAmounts.units)
                .toEqual(expect.arrayContaining(
                        [
                            new TrackedUnit({
                                target: new Unit(testComponentTwo, 3),
                                actual: new Unit(testComponentTwo, 3)
                            })
                        ]
                    )
                );

            expect(craftingAttemptResult.requiresCatalysts).toEqual(true);
            expect(craftingAttemptResult.catalystAmounts.isSufficient).toEqual(true);
            expect(craftingAttemptResult.catalystAmounts.isEmpty).toEqual(false);
            expect(craftingAttemptResult.catalystAmounts.deficit).toEqual(0);
            expect(craftingAttemptResult.catalystAmounts.units)
                .toEqual(expect.arrayContaining(
                        [
                            new TrackedUnit({
                                target: new Unit(testComponentThree, 1),
                                actual: new Unit(testComponentThree, 1)
                            })
                        ]
                    )
                );

        });

    });

});