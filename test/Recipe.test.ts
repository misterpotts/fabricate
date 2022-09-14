import {expect, jest, test, beforeEach} from "@jest/globals";
import {ComponentGroup, Recipe} from "../src/scripts/crafting/Recipe";

import {
    testComponentFive, testComponentFour,
    testComponentOne,
    testComponentThree,
    testComponentTwo
} from "./test_data/TestCraftingComponents";
import {Combination, Unit} from "../src/scripts/common/Combination";
import {CraftingComponent} from "../src/scripts/common/CraftingComponent";
import {Essence} from "../src/scripts/common/Essence";
import {elementalAir, elementalFire} from "./test_data/TestEssenceDefinitions";

beforeEach(() => {
    jest.resetAllMocks();
});

describe("When creating a recipe", () => {

    const id = "hq4F67hS";

    test("should correctly assess requirements for a recipe with essences only", () => {

        const underTest = new Recipe({
            id,
            ingredientGroups: [ComponentGroup.EMPTY()],
            resultGroups: [ComponentGroup.EMPTY()],
            essences: Combination.ofUnits([
                new Unit<Essence>(elementalFire, 1),
                new Unit<Essence>(elementalAir, 1)
            ])
        });

        expect(underTest.essences.size()).toEqual(2);
        expect(underTest.essences.amountFor(elementalFire)).toEqual(1);
        expect(underTest.essences.amountFor(elementalAir)).toEqual(1);

        expect(underTest.hasOptions()).toEqual(false);
        expect(underTest.hasAllSelectionsMade()).toEqual(true);
        expect(underTest.requiresEssences()).toEqual(true);
        expect(underTest.hasIngredients()).toEqual(false);
        expect(underTest.requiresCatalysts()).toEqual(false);
        expect(underTest.requiresNamedComponents()).toEqual(false);

    });

    test("should correctly assess requirements for a recipe with essences and catalysts", () => {

        const underTest = new Recipe({
            id,
            ingredientGroups: [ComponentGroup.EMPTY()],
            resultGroups: [ComponentGroup.EMPTY()],
            essences: Combination.ofUnits([
                new Unit<Essence>(elementalFire, 1),
                new Unit<Essence>(elementalAir, 1)
            ]),
            catalysts: Combination.of(testComponentFour, 1)
        });

        expect(underTest.catalysts.size()).toEqual(1);
        expect(underTest.catalysts.amountFor(testComponentFour)).toEqual(1);
        expect(underTest.essences.size()).toEqual(2);
        expect(underTest.essences.amountFor(elementalFire)).toEqual(1);
        expect(underTest.essences.amountFor(elementalAir)).toEqual(1);

        expect(underTest.hasOptions()).toEqual(false);
        expect(underTest.hasAllSelectionsMade()).toEqual(true);
        expect(underTest.requiresEssences()).toEqual(true);
        expect(underTest.hasIngredients()).toEqual(false);
        expect(underTest.requiresCatalysts()).toEqual(true);
        expect(underTest.requiresNamedComponents()).toEqual(true);

    });

    test("should correctly assess requirements for a recipe with named ingredients only", () => {

        const combinationOne = Combination.ofUnits([
            new Unit<CraftingComponent>(testComponentFive, 3),
            new Unit<CraftingComponent>(testComponentThree, 2)
        ]);

        const componentGroupOne: ComponentGroup = new ComponentGroup(combinationOne);

        const underTest = new Recipe({
            id,
            ingredientGroups: [componentGroupOne],
            resultGroups: [ComponentGroup.EMPTY()]
        });

        expect(underTest.ingredientGroups.length).toEqual(1);
        expect(underTest.resultGroups.length).toEqual(1);

        expect(underTest.hasOptions()).toEqual(true);
        expect(underTest.hasAllSelectionsMade()).toEqual(false);
        expect(underTest.requiresEssences()).toEqual(false);
        expect(underTest.hasIngredients()).toEqual(true);
        expect(underTest.requiresCatalysts()).toEqual(false);
        expect(underTest.requiresNamedComponents()).toEqual(true);

    });

    test("should correctly assess requirements for a recipe with named ingredients and catalysts", () => {

        const combinationOne = Combination.ofUnits([
            new Unit<CraftingComponent>(testComponentFive, 3),
            new Unit<CraftingComponent>(testComponentThree, 2)
        ]);

        const componentGroupOne: ComponentGroup = new ComponentGroup(combinationOne);

        const underTest = new Recipe({
            id,
            ingredientGroups: [componentGroupOne],
            resultGroups: [ComponentGroup.EMPTY()]
        });

        expect(underTest.ingredientGroups.length).toEqual(1);
        expect(underTest.resultGroups.length).toEqual(1);

        expect(underTest.hasOptions()).toEqual(true);
        expect(underTest.hasAllSelectionsMade()).toEqual(false);
        expect(underTest.requiresEssences()).toEqual(false);
        expect(underTest.hasIngredients()).toEqual(true);
        expect(underTest.requiresCatalysts()).toEqual(false);
        expect(underTest.requiresNamedComponents()).toEqual(true);

    });

    test("should correctly assess requirements for a recipe with both essences and named ingredients", () => {

        const combinationOne = Combination.ofUnits([
            new Unit<CraftingComponent>(testComponentFive, 3),
            new Unit<CraftingComponent>(testComponentThree, 2)
        ]);

        const combinationTwo = Combination.ofUnits([
            new Unit<CraftingComponent>(testComponentOne, 1)
        ]);

        const componentGroupOne: ComponentGroup = new ComponentGroup(combinationOne);
        const componentGroupTwo: ComponentGroup = new ComponentGroup(combinationTwo);

        const underTest = new Recipe({
            id,
            ingredientGroups: [componentGroupOne, componentGroupTwo],
            resultGroups: [ComponentGroup.EMPTY()],
            essences: Combination.ofUnits([
                new Unit<Essence>(elementalFire, 1),
                new Unit<Essence>(elementalAir, 1)
            ]),
            catalysts: Combination.of(testComponentFour, 1)
        });

        expect(underTest.ingredientGroups.length).toEqual(2);
        expect(underTest.resultGroups.length).toEqual(1);

        expect(underTest.hasOptions()).toEqual(true);
        expect(underTest.hasAllSelectionsMade()).toEqual(false);
        expect(underTest.requiresEssences()).toEqual(true);
        expect(underTest.hasIngredients()).toEqual(true);
        expect(underTest.requiresCatalysts()).toEqual(true);
        expect(underTest.requiresNamedComponents()).toEqual(true);

    });

});

describe("When selecting ingredients", () => {

    const id = "hq4F67hS";

    test("should combine ingredient groups with no choices when selecting ingredients", () => {

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

    test("should require choices from ingredient groups with options", () => {

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
            ingredientGroups: [componentGroupOne, componentGroupTwo],
            resultGroups: [ComponentGroup.EMPTY()]
        });

        expect(underTest.hasAllSelectionsMade()).toEqual(false);

        expect(underTest.getSelectedIngredients).toThrow(Error);

    });

    test("should produce the correct selected ingredients when components in an ingredient group are re-selected", () => {

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
            ingredientGroups: [componentGroupOne, componentGroupTwo],
            resultGroups: [ComponentGroup.EMPTY()]
        });

        underTest.selectIngredient(0, testComponentOne);

        expect(underTest.hasAllSelectionsMade()).toEqual(true);

        const selectedIngredientSetOne = underTest.getSelectedIngredients();
        expect(selectedIngredientSetOne.size()).toEqual(3);
        expect(selectedIngredientSetOne.amountFor(testComponentOne)).toEqual(1);
        expect(selectedIngredientSetOne.has(testComponentTwo)).toEqual(false);
        expect(selectedIngredientSetOne.amountFor(testComponentTwo)).toEqual(0);
        expect(selectedIngredientSetOne.amountFor(testComponentThree)).toEqual(2);

        underTest.selectIngredient(0, testComponentTwo);

        expect(underTest.hasAllSelectionsMade()).toEqual(true);

        const selectedIngredientSetTwo = underTest.getSelectedIngredients();
        expect(selectedIngredientSetTwo.size()).toEqual(3);
        expect(selectedIngredientSetTwo.has(testComponentOne)).toEqual(false);
        expect(selectedIngredientSetTwo.amountFor(testComponentOne)).toEqual(0);
        expect(selectedIngredientSetTwo.amountFor(testComponentTwo)).toEqual(1);
        expect(selectedIngredientSetTwo.amountFor(testComponentThree)).toEqual(2);

    });

});

describe("When selecting results", () => {

    const id = "hq4F67hS";

    test("should combine result groups with no choices when selecting results", () => {

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
            resultGroups: [componentGroupOne, componentGroupTwo],
            ingredientGroups: [ComponentGroup.EMPTY()]
        });

        const selectedResults = underTest.getSelectedResults();
        expect(selectedResults.size()).toEqual(5);
        expect(selectedResults.amountFor(testComponentFive)).toEqual(5);

    });

    test("should require choices from result groups with options", () => {

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
            resultGroups: [componentGroupOne, componentGroupTwo],
            ingredientGroups: [ComponentGroup.EMPTY()]
        });

        expect(underTest.hasAllSelectionsMade()).toEqual(false);

        expect(underTest.getSelectedResults).toThrow(Error);

    });

    test("should produce the correct selected results when components in a result group are re-selected", () => {

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
            resultGroups: [componentGroupOne, componentGroupTwo],
            ingredientGroups: [ComponentGroup.EMPTY()]
        });

        underTest.selectResult(0, testComponentOne);

        expect(underTest.hasAllSelectionsMade()).toEqual(true);

        const selectedResultSetOne = underTest.getSelectedResults();
        expect(selectedResultSetOne.size()).toEqual(3);
        expect(selectedResultSetOne.amountFor(testComponentOne)).toEqual(1);
        expect(selectedResultSetOne.has(testComponentTwo)).toEqual(false);
        expect(selectedResultSetOne.amountFor(testComponentTwo)).toEqual(0);
        expect(selectedResultSetOne.amountFor(testComponentThree)).toEqual(2);

        underTest.selectResult(0, testComponentTwo);

        expect(underTest.hasAllSelectionsMade()).toEqual(true);

        const selectedResultSetTwo = underTest.getSelectedResults();
        expect(selectedResultSetTwo.size()).toEqual(3);
        expect(selectedResultSetTwo.has(testComponentOne)).toEqual(false);
        expect(selectedResultSetTwo.amountFor(testComponentOne)).toEqual(0);
        expect(selectedResultSetTwo.amountFor(testComponentTwo)).toEqual(1);
        expect(selectedResultSetTwo.amountFor(testComponentThree)).toEqual(2);

    });

});
