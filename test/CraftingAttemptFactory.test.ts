import {describe, expect, test} from "@jest/globals";
import {CraftingAttemptFactory} from "../src/scripts/crafting/attempt/CraftingAttemptFactory";
import {DefaultComponentSelectionStrategy} from "../src/scripts/crafting/selection/ComponentSelectionStrategy";
import {Combination, Unit} from "../src/scripts/common/Combination";
import {testRecipeFive, testRecipeFour} from "./test_data/TestRecipes";
import {CraftingComponent} from "../src/scripts/common/CraftingComponent";
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

            const underTest = new CraftingAttemptFactory({ selectionStrategy });

            const availableComponents = Combination.EMPTY<CraftingComponent>();

            const result = underTest.make(availableComponents, testRecipeFive.essences, testRecipeFive.getSelectedIngredients());

            expect(result.isPossible).toEqual(false);

            expect(result.requiresEssences).toEqual(true);
            expect(result.essenceAmounts.isSufficient).toEqual(false);
            expect(result.essenceAmounts.deficit).toEqual(2);
            expect(result.essenceAmounts.units)
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
            expect(result.essenceSources.isEmpty()).toEqual(true);

            expect(result.requiresIngredients).toEqual(false);
            expect(result.ingredientAmounts.isSufficient).toEqual(true);
            expect(result.ingredientAmounts.isEmpty).toEqual(true);

            expect(result.requiresCatalysts).toEqual(true);
            expect(result.catalystAmounts.isSufficient).toEqual(false);
            expect(result.catalystAmounts.units)
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

            const underTest = new CraftingAttemptFactory({ selectionStrategy });

            const availableComponents = testRecipeFour.getSelectedIngredients().ingredients
                .combineWith(testRecipeFour.getSelectedIngredients().catalysts)
                .combineWith(Combination.ofUnits([
                    new Unit(testComponentOne, 1),
                    new Unit(testComponentSix, 2)
                ]));

            const result = underTest.make(availableComponents, testRecipeFour.essences, testRecipeFour.getSelectedIngredients());

            expect(result.isPossible).toEqual(true);

            expect(result.requiresEssences).toEqual(true);
            expect(result.essenceAmounts.isSufficient).toEqual(true);
            expect(result.essenceAmounts.isEmpty).toEqual(false);
            expect(result.essenceAmounts.deficit).toEqual(0);
            expect(result.essenceAmounts.units)
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
            expect(result.essenceSources.units)
                .toEqual(expect.arrayContaining(
                        [
                            new Unit(testComponentOne, 1),
                            new Unit(testComponentSix, 2),
                        ]
                    )
                );

            expect(result.requiresIngredients).toEqual(true);
            expect(result.ingredientAmounts.isSufficient).toEqual(true);
            expect(result.ingredientAmounts.isEmpty).toEqual(false);
            expect(result.ingredientAmounts.deficit).toEqual(0);
            expect(result.ingredientAmounts.units)
                .toEqual(expect.arrayContaining(
                        [
                            new TrackedUnit({
                                target: new Unit(testComponentTwo, 3),
                                actual: new Unit(testComponentTwo, 3)
                            })
                        ]
                    )
                );

            expect(result.requiresCatalysts).toEqual(true);
            expect(result.catalystAmounts.isSufficient).toEqual(true);
            expect(result.catalystAmounts.isEmpty).toEqual(false);
            expect(result.catalystAmounts.deficit).toEqual(0);
            expect(result.catalystAmounts.units)
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