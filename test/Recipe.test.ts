import {expect, jest, test, beforeEach} from "@jest/globals";
import {ComponentGroup, Recipe} from "../src/scripts/crafting/Recipe";

import {
    testComponentFive, testComponentFour,
    testComponentOne,
    testComponentThree,
    testComponentTwo
} from "./test_data/TestCraftingComponents";
import {CombinableString, Combination, Unit} from "../src/scripts/common/Combination";
import {elementalEarth, elementalFire, elementalWater} from "./test_data/TestEssenceDefinitions";
import {testRecipeFive, testRecipeOne, testRecipeSix, testRecipeThree, testRecipeTwo} from "./test_data/TestRecipes";

beforeEach(() => {
    jest.resetAllMocks();
});

describe("When creating a recipe", () => {

    test("should correctly assess requirements for a recipe with essences only", () => {
        const underTest = testRecipeThree;

        expect(underTest.essences.size()).toEqual(4);
        expect(underTest.essences.amountFor(new CombinableString(elementalFire.id))).toEqual(1);
        expect(underTest.essences.amountFor(new CombinableString(elementalEarth.id))).toEqual(3);

        expect(underTest.hasOptions()).toEqual(false);
        expect(underTest.hasAllSelectionsMade()).toEqual(true);
        expect(underTest.requiresEssences()).toEqual(true);
        expect(underTest.hasIngredients()).toEqual(false);
        expect(underTest.requiresCatalysts()).toEqual(false);
        expect(underTest.requiresNamedComponents()).toEqual(false);
    });

    test("should correctly assess requirements for a recipe with essences and catalysts", () => {
        const underTest = testRecipeFive;

        expect(underTest.catalysts.size()).toEqual(1);
        expect(underTest.catalysts.amountFor(new CombinableString(testComponentFour.id))).toEqual(1);
        expect(underTest.essences.size()).toEqual(2);
        expect(underTest.essences.amountFor(new CombinableString(elementalFire.id))).toEqual(1);
        expect(underTest.essences.amountFor(new CombinableString(elementalWater.id))).toEqual(1);

        expect(underTest.hasOptions()).toEqual(false);
        expect(underTest.hasAllSelectionsMade()).toEqual(true);
        expect(underTest.requiresEssences()).toEqual(true);
        expect(underTest.hasIngredients()).toEqual(false);
        expect(underTest.requiresCatalysts()).toEqual(true);
        expect(underTest.requiresNamedComponents()).toEqual(true);
    });

    test("should correctly assess requirements for a recipe with two groups of named ingredients only", () => {
        const underTest = testRecipeOne;

        expect(underTest.ingredientGroups.length).toEqual(2);
        expect(underTest.resultGroups.length).toEqual(1);

        expect(underTest.hasOptions()).toEqual(false);
        expect(underTest.hasAllSelectionsMade()).toEqual(true);
        expect(underTest.requiresEssences()).toEqual(false);
        expect(underTest.hasIngredients()).toEqual(true);
        expect(underTest.requiresCatalysts()).toEqual(false);
        expect(underTest.requiresNamedComponents()).toEqual(true);
    });

    test("should correctly assess requirements for a recipe with named ingredients and catalysts", () => {
        const underTest = testRecipeTwo;

        expect(underTest.ingredientGroups.length).toEqual(1);
        expect(underTest.resultGroups.length).toEqual(1);
        expect(underTest.catalysts.size()).toEqual(1);

        expect(underTest.hasOptions()).toEqual(false);
        expect(underTest.hasAllSelectionsMade()).toEqual(true);
        expect(underTest.requiresEssences()).toEqual(false);
        expect(underTest.hasIngredients()).toEqual(true);
        expect(underTest.requiresCatalysts()).toEqual(true);
        expect(underTest.requiresNamedComponents()).toEqual(true);
    });

    test("should correctly assess requirements for a recipe with both essences and named ingredients", () => {
        const underTest = testRecipeSix;

        expect(underTest.ingredientGroups.length).toEqual(2);
        expect(underTest.resultGroups.length).toEqual(1);
        expect(underTest.essences.size()).toEqual(4);

        expect(underTest.hasOptions()).toEqual(true);
        expect(underTest.hasAllSelectionsMade()).toEqual(false);
        expect(underTest.requiresEssences()).toEqual(true);
        expect(underTest.hasIngredients()).toEqual(true);
        expect(underTest.requiresCatalysts()).toEqual(false);
        expect(underTest.requiresNamedComponents()).toEqual(true);
    });

});

describe("When selecting ingredients", () => {

    const id = "hq4F67hS";

    test("should combine ingredient groups with no choices when selecting ingredients", () => {

        const combinationOne = Combination.ofUnits([
            new Unit(new CombinableString(testComponentFive.id), 3)
        ]);

        const combinationTwo = Combination.ofUnits([
            new Unit(new CombinableString(testComponentFive.id), 2)
        ]);

        const componentGroupOne: ComponentGroup = new ComponentGroup(combinationOne);
        const componentGroupTwo: ComponentGroup = new ComponentGroup(combinationTwo);

        const underTest = new Recipe({
            id,
            name: "Test Recipe",
            ingredientGroups: [componentGroupOne, componentGroupTwo],
            resultGroups: [ComponentGroup.EMPTY()]
        });

        const selectedIngredients = underTest.getSelectedIngredients();
        expect(selectedIngredients.size()).toEqual(5);
        expect(selectedIngredients.amountFor(new CombinableString(testComponentFive.id))).toEqual(5);

    });

    test("should require choices from ingredient groups with options", () => {

        const combinationOne = Combination.ofUnits([
            new Unit(new CombinableString(testComponentOne.id), 1),
            new Unit(new CombinableString(testComponentTwo.id), 1)
        ]);

        const combinationTwo = Combination.ofUnits([
            new Unit(new CombinableString(testComponentThree.id), 2)
        ]);

        const componentGroupOne: ComponentGroup = new ComponentGroup(combinationOne);
        const componentGroupTwo: ComponentGroup = new ComponentGroup(combinationTwo);

        const underTest = new Recipe({
            id,
            name: "Test Recipe",
            ingredientGroups: [componentGroupOne, componentGroupTwo],
            resultGroups: [ComponentGroup.EMPTY()]
        });

        expect(underTest.hasAllSelectionsMade()).toEqual(false);

        expect(underTest.getSelectedIngredients).toThrow(Error);

    });

    test("should produce the correct selected ingredients when components in an ingredient group are re-selected", () => {

        const combinationOne = Combination.ofUnits([
            new Unit(new CombinableString(testComponentOne.id), 1),
            new Unit(new CombinableString(testComponentTwo.id), 1)
        ]);

        const combinationTwo = Combination.ofUnits([
            new Unit(new CombinableString(testComponentThree.id), 2)
        ]);

        const componentGroupOne: ComponentGroup = new ComponentGroup(combinationOne);
        const componentGroupTwo: ComponentGroup = new ComponentGroup(combinationTwo);

        const underTest = new Recipe({
            id,
            name: "Test Recipe",
            ingredientGroups: [componentGroupOne, componentGroupTwo],
            resultGroups: [ComponentGroup.EMPTY()]
        });

        underTest.selectIngredient(0, testComponentOne.id);

        expect(underTest.hasAllSelectionsMade()).toEqual(true);

        const selectedIngredientSetOne = underTest.getSelectedIngredients();
        expect(selectedIngredientSetOne.size()).toEqual(3);
        expect(selectedIngredientSetOne.amountFor(new CombinableString(testComponentOne.id))).toEqual(1);
        expect(selectedIngredientSetOne.has(new CombinableString(testComponentTwo.id))).toEqual(false);
        expect(selectedIngredientSetOne.amountFor(new CombinableString(testComponentTwo.id))).toEqual(0);
        expect(selectedIngredientSetOne.amountFor(new CombinableString(testComponentThree.id))).toEqual(2);

        underTest.selectIngredient(0, testComponentTwo.id);

        expect(underTest.hasAllSelectionsMade()).toEqual(true);

        const selectedIngredientSetTwo = underTest.getSelectedIngredients();
        expect(selectedIngredientSetTwo.size()).toEqual(3);
        expect(selectedIngredientSetTwo.has(new CombinableString(testComponentOne.id))).toEqual(false);
        expect(selectedIngredientSetTwo.amountFor(new CombinableString(testComponentOne.id))).toEqual(0);
        expect(selectedIngredientSetTwo.amountFor(new CombinableString(testComponentTwo.id))).toEqual(1);
        expect(selectedIngredientSetTwo.amountFor(new CombinableString(testComponentThree.id))).toEqual(2);

    });

});

describe("When selecting results", () => {

    const id = "hq4F67hS";

    test("should combine result groups with no choices when selecting results", () => {

        const combinationOne = Combination.ofUnits([
            new Unit(new CombinableString(testComponentFive.id), 3)
        ]);

        const combinationTwo = Combination.ofUnits([
            new Unit(new CombinableString(testComponentFive.id), 2)
        ]);

        const componentGroupOne: ComponentGroup = new ComponentGroup(combinationOne);
        const componentGroupTwo: ComponentGroup = new ComponentGroup(combinationTwo);

        const underTest = new Recipe({
            id,
            name: "Test Recipe",
            resultGroups: [componentGroupOne, componentGroupTwo],
            ingredientGroups: [ComponentGroup.EMPTY()]
        });

        const selectedResults = underTest.getSelectedResults();
        expect(selectedResults.size()).toEqual(5);
        expect(selectedResults.amountFor(new CombinableString(testComponentFive.id))).toEqual(5);

    });

    test("should require choices from result groups with options", () => {

        const combinationOne = Combination.ofUnits([
            new Unit(new CombinableString(testComponentOne.id), 1),
            new Unit(new CombinableString(testComponentTwo.id), 1)
        ]);

        const combinationTwo = Combination.ofUnits([
            new Unit(new CombinableString(testComponentThree.id), 2)
        ]);

        const componentGroupOne: ComponentGroup = new ComponentGroup(combinationOne);
        const componentGroupTwo: ComponentGroup = new ComponentGroup(combinationTwo);

        const underTest = new Recipe({
            id,
            name: "Test Recipe",
            resultGroups: [componentGroupOne, componentGroupTwo],
            ingredientGroups: [ComponentGroup.EMPTY()]
        });

        expect(underTest.hasAllSelectionsMade()).toEqual(false);

        expect(underTest.getSelectedResults).toThrow(Error);

    });

    test("should produce the correct selected results when components in a result group are re-selected", () => {

        const combinationOne = Combination.ofUnits([
            new Unit(new CombinableString(testComponentOne.id), 1),
            new Unit(new CombinableString(testComponentTwo.id), 1)
        ]);

        const combinationTwo = Combination.ofUnits([
            new Unit(new CombinableString(testComponentThree.id), 2)
        ]);

        const componentGroupOne: ComponentGroup = new ComponentGroup(combinationOne);
        const componentGroupTwo: ComponentGroup = new ComponentGroup(combinationTwo);

        const underTest = new Recipe({
            id,
            name: "Test Recipe",
            resultGroups: [componentGroupOne, componentGroupTwo],
            ingredientGroups: [ComponentGroup.EMPTY()]
        });

        underTest.selectResult(0, testComponentOne.id);

        expect(underTest.hasAllSelectionsMade()).toEqual(true);

        const selectedResultSetOne = underTest.getSelectedResults();
        expect(selectedResultSetOne.size()).toEqual(3);
        expect(selectedResultSetOne.amountFor(new CombinableString(testComponentOne.id))).toEqual(1);
        expect(selectedResultSetOne.has(new CombinableString(testComponentTwo.id))).toEqual(false);
        expect(selectedResultSetOne.amountFor(new CombinableString(testComponentTwo.id))).toEqual(0);
        expect(selectedResultSetOne.amountFor(new CombinableString(testComponentThree.id))).toEqual(2);

        underTest.selectResult(0, testComponentTwo.id);

        expect(underTest.hasAllSelectionsMade()).toEqual(true);

        const selectedResultSetTwo = underTest.getSelectedResults();
        expect(selectedResultSetTwo.size()).toEqual(3);
        expect(selectedResultSetTwo.has(new CombinableString(testComponentOne.id))).toEqual(false);
        expect(selectedResultSetTwo.amountFor(new CombinableString(testComponentOne.id))).toEqual(0);
        expect(selectedResultSetTwo.amountFor(new CombinableString(testComponentTwo.id))).toEqual(1);
        expect(selectedResultSetTwo.amountFor(new CombinableString(testComponentThree.id))).toEqual(2);

    });

});
