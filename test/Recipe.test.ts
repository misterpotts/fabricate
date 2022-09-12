import {expect, jest, test, beforeEach} from "@jest/globals";
import {ComponentGroup, Recipe} from "../src/scripts/crafting/Recipe";

import {
    testComponentFive,
    testComponentOne,
    testComponentThree,
    testComponentTwo
} from "./test_data/TestCraftingComponents";
import {Combination, Unit} from "../src/scripts/common/Combination";
import {CraftingComponent} from "../src/scripts/common/CraftingComponent";

beforeEach(() => {
    jest.resetAllMocks();
});

describe("When selecting ingredients", () => {

    const id = "hq4F67hS";

    test("should combine component groups with no choices", () => {

        const combinationOne = Combination.ofUnits([
            new Unit<CraftingComponent>(testComponentFive, 3)
        ]);

        const combinationTwo = Combination.ofUnits([
            new Unit<CraftingComponent>(testComponentFive, 2)
        ]);

        const componentGroupOne: ComponentGroup = new ComponentGroup(combinationOne);
        const componentGroupTwo: ComponentGroup = new ComponentGroup(combinationTwo);

        const underTest = new Recipe({
            id,
            ingredientGroups: [componentGroupOne, componentGroupTwo],
            resultGroups: [ComponentGroup.EMPTY()]
        });

        const selectedIngredients = underTest.getSelectedIngredients();
        expect(selectedIngredients.size()).toEqual(5);
        expect(selectedIngredients.amountFor(testComponentFive)).toEqual(5);

    });

    test("should require choices from groups with options", () => {

        const combinationOne = Combination.ofUnits([
            new Unit<CraftingComponent>(testComponentOne, 1),
            new Unit<CraftingComponent>(testComponentTwo, 1)
        ]);

        const combinationTwo = Combination.ofUnits([
            new Unit<CraftingComponent>(testComponentThree, 2)
        ]);

        const componentGroupOne: ComponentGroup = new ComponentGroup(combinationOne);
        const componentGroupTwo: ComponentGroup = new ComponentGroup(combinationTwo);

        const underTest = new Recipe({
            id,
            ingredientGroups:[componentGroupOne, componentGroupTwo],
            resultGroups: [ComponentGroup.EMPTY()]
        });

        expect(underTest.hasAllSelectionsMade()).toEqual(false);

        expect(underTest.getSelectedIngredients).toThrow(Error);

    });

    test("should produce the correct ingredients when components are re-selected", () => {

        const combinationOne = Combination.ofUnits([
            new Unit<CraftingComponent>(testComponentOne, 1),
            new Unit<CraftingComponent>(testComponentTwo, 1)
        ]);

        const combinationTwo = Combination.ofUnits([
            new Unit<CraftingComponent>(testComponentThree, 2)
        ]);

        const componentGroupOne: ComponentGroup = new ComponentGroup(combinationOne);
        const componentGroupTwo: ComponentGroup = new ComponentGroup(combinationTwo);

        const underTest = new Recipe({
            id,
            ingredientGroups:[componentGroupOne, componentGroupTwo],
            resultGroups: [ComponentGroup.EMPTY()]
        });

        underTest.select(0, testComponentOne);

        expect(underTest.hasAllSelectionsMade()).toEqual(true);

        const selectedIngredientSetOne = underTest.getSelectedIngredients();
        expect(selectedIngredientSetOne.size()).toEqual(3);
        expect(selectedIngredientSetOne.amountFor(testComponentOne)).toEqual(1);
        expect(selectedIngredientSetOne.has(testComponentTwo)).toEqual(false);
        expect(selectedIngredientSetOne.amountFor(testComponentTwo)).toEqual(0);
        expect(selectedIngredientSetOne.amountFor(testComponentThree)).toEqual(2);

        underTest.select(0, testComponentTwo);

        expect(underTest.hasAllSelectionsMade()).toEqual(true);

        const selectedIngredientSetTwo = underTest.getSelectedIngredients();
        expect(selectedIngredientSetTwo.size()).toEqual(3);
        expect(selectedIngredientSetTwo.has(testComponentOne)).toEqual(false);
        expect(selectedIngredientSetTwo.amountFor(testComponentOne)).toEqual(0);
        expect(selectedIngredientSetTwo.amountFor(testComponentTwo)).toEqual(1);
        expect(selectedIngredientSetTwo.amountFor(testComponentThree)).toEqual(2);

    });

});