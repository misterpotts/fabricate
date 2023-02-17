import {expect, jest, test, beforeEach, describe} from "@jest/globals";
import {CombinationChoice, Recipe} from "../src/scripts/common/Recipe";

import {
    testComponentOne,
    testComponentTwo,
    testComponentThree,
    testComponentFour,
    testComponentFive
} from "./test_data/TestCraftingComponents";
import {Combination, Unit} from "../src/scripts/common/Combination";
import {elementalEarth, elementalFire, elementalWater} from "./test_data/TestEssences";
import {
    testRecipeFive,
    testRecipeSeven,
    testRecipeSix,
    testRecipeThree,
    testRecipeTwo
} from "./test_data/TestRecipes";

beforeEach(() => {
    jest.resetAllMocks();
});

describe("When creating a recipe", () => {

    test("should correctly assess requirements for a recipe with essences only", () => {
        const underTest = testRecipeThree;

        expect(underTest.essences.size).toEqual(4);
        expect(underTest.essences.amountFor(elementalFire.id)).toEqual(1);
        expect(underTest.essences.amountFor(elementalEarth.id)).toEqual(3);

        expect(underTest.hasOptions).toEqual(false);
        expect(underTest.ready()).toEqual(true);
        expect(underTest.requiresEssences()).toEqual(true);
        expect(underTest.hasIngredients()).toEqual(false);
        expect(underTest.requiresCatalysts()).toEqual(false);
        expect(underTest.requiresNamedComponents()).toEqual(false);
    });

    test("should correctly assess requirements for a recipe with essences and catalysts", () => {
        const underTest = testRecipeFive;

        expect(underTest.catalysts.size).toEqual(1);
        expect(underTest.catalysts.amountFor(testComponentFour.id)).toEqual(1);
        expect(underTest.essences.size).toEqual(2);
        expect(underTest.essences.amountFor(elementalFire.id)).toEqual(1);
        expect(underTest.essences.amountFor(elementalWater.id)).toEqual(1);

        expect(underTest.hasOptions).toEqual(false);
        expect(underTest.ready()).toEqual(true);
        expect(underTest.requiresEssences()).toEqual(true);
        expect(underTest.hasIngredients()).toEqual(false);
        expect(underTest.requiresCatalysts()).toEqual(true);
        expect(underTest.requiresNamedComponents()).toEqual(true);
    });

    test("should correctly assess requirements for a recipe with one set of named ingredients only", () => {
        const underTest = testRecipeSeven;

        expect(underTest.ingredientOptions.size).toEqual(1);
        expect(underTest.resultOptions.size).toEqual(1);

        expect(underTest.hasOptions).toEqual(false);
        expect(underTest.ready()).toEqual(true);
        expect(underTest.requiresEssences()).toEqual(false);
        expect(underTest.hasIngredients()).toEqual(true);
        expect(underTest.requiresCatalysts()).toEqual(false);
        expect(underTest.requiresNamedComponents()).toEqual(true);
    });

    test("should correctly assess requirements for a recipe with named ingredients and catalysts", () => {
        const underTest = testRecipeTwo;

        expect(underTest.ingredientOptions.size).toEqual(1);
        expect(underTest.resultOptions.size).toEqual(1);
        expect(underTest.catalysts.size).toEqual(1);

        expect(underTest.hasOptions).toEqual(false);
        expect(underTest.ready()).toEqual(true);
        expect(underTest.requiresEssences()).toEqual(false);
        expect(underTest.hasIngredients()).toEqual(true);
        expect(underTest.requiresCatalysts()).toEqual(true);
        expect(underTest.requiresNamedComponents()).toEqual(true);
    });

    test("should correctly assess requirements for a recipe with both essences and named ingredients", () => {
        const underTest = testRecipeSix;

        expect(underTest.ingredientOptions.size).toEqual(2);
        expect(underTest.resultOptions.size).toEqual(2);
        expect(underTest.essences.size).toEqual(4);

        expect(underTest.hasOptions).toEqual(true);
        expect(underTest.ready()).toEqual(false);
        expect(underTest.requiresEssences()).toEqual(true);
        expect(underTest.hasIngredients()).toEqual(true);
        expect(underTest.requiresCatalysts()).toEqual(false);
        expect(underTest.requiresNamedComponents()).toEqual(true);
    });

});

describe("When selecting ingredients", () => {

    const id = "hq4F67hS";

    test("should require choices from ingredient groups with options", () => {

        const combinationOne = Combination.ofUnits([
            new Unit(testComponentOne, 1),
            new Unit(testComponentTwo, 1)
        ]);

        const combinationTwo = Combination.ofUnits([
            new Unit(testComponentThree, 2)
        ]);

        const underTest = new Recipe({
            id,
            name: "Test Recipe",
            ingredientOptions: CombinationChoice.between(combinationOne, combinationTwo),
            resultOptions: CombinationChoice.NONE()
        });

        expect(underTest.ready()).toEqual(false);

        expect(underTest.getSelectedIngredients).toThrow(Error);

    });

    test("should produce the correct selected ingredients when components in an ingredient group are re-selected", () => {

        const combinationOne = Combination.ofUnits([
            new Unit(testComponentOne, 1),
            new Unit(testComponentTwo, 1)
        ]);

        const combinationTwo = Combination.ofUnits([
            new Unit(testComponentThree, 2)
        ]);

        const optionOneId = "1";
        const optionTwoId = "2";
        const underTest = new Recipe({
            id,
            name: "Test Recipe",
            ingredientOptions: CombinationChoice.of([optionOneId, combinationOne], [optionTwoId, combinationTwo]),
            resultOptions: CombinationChoice.NONE()
        });

        expect(underTest.ingredientOptions.size).toEqual(2);
        expect(underTest.ready()).toEqual(false);

        underTest.selectIngredientCombination(optionOneId);
        expect(underTest.ready()).toEqual(true);

        let selectedIngredients = underTest.getSelectedIngredients();

        expect(selectedIngredients.equals(combinationOne)).toEqual(true);
        expect(combinationOne.equals(selectedIngredients)).toEqual(true);

        underTest.selectIngredientCombination(optionTwoId);
        expect(underTest.ready()).toEqual(true);

        selectedIngredients = underTest.getSelectedIngredients();

        expect(selectedIngredients.equals(combinationTwo)).toEqual(true);
        expect(combinationTwo.equals(selectedIngredients)).toEqual(true);
    });

});

describe("When selecting results", () => {

    const id = "hq4F67hS";

    test("should not require choice when there is only one option", () => {

        const singletonResult = Combination.ofUnits([
            new Unit(testComponentFive, 3),
            new Unit(testComponentOne, 1)
        ]);

        const singletonIngredient = Combination.ofUnits([
            new Unit(testComponentFour, 2)
        ]);

        const underTest = new Recipe({
            id,
            name: "Test Recipe",
            resultOptions: CombinationChoice.just(singletonResult),
            ingredientOptions: CombinationChoice.just(singletonIngredient)
        });

        const selectedResults = underTest.getSelectedResults();
        expect(selectedResults.size).toEqual(4);
        expect(selectedResults.amountFor(testComponentFive.id)).toEqual(3);
        expect(selectedResults.amountFor(testComponentOne.id)).toEqual(1);

        const selectedIngredients = underTest.getSelectedIngredients();
        expect(selectedIngredients.size).toEqual(2);
        expect(selectedIngredients.amountFor(testComponentFour.id)).toEqual(2);

    });

    test("should require choices from result groups with options", () => {

        const ingredientCombinationOne = Combination.ofUnits([
            new Unit(testComponentOne, 1),
            new Unit(testComponentTwo, 1)
        ]);

        const ingredientCombinationTwo = Combination.ofUnits([
            new Unit(testComponentThree, 2)
        ]);

        const resultCombination = Combination.ofUnits([
            new Unit(testComponentFour, 2)
        ]);

        const underTest = new Recipe({
            id,
            name: "Test Recipe",
            resultOptions: CombinationChoice.just(resultCombination),
            ingredientOptions: CombinationChoice.between(ingredientCombinationOne, ingredientCombinationTwo)
        });

        expect(underTest.ready()).toEqual(false);

        expect(underTest.getSelectedResults).toThrow(Error);

    });

    test("should produce the correct selected results when components in a result group are re-selected", () => {

        const combinationOne = Combination.ofUnits([
            new Unit(testComponentOne, 1),
            new Unit(testComponentTwo, 1)
        ]);

        const combinationTwo = Combination.ofUnits([
            new Unit(testComponentThree, 2)
        ]);

        const optionOneId = "1";
        const optionTwoId = "2";
        const underTest = new Recipe({
            id,
            name: "Test Recipe",
            resultOptions: CombinationChoice.of([optionOneId, combinationOne], [optionTwoId, combinationTwo]),
            ingredientOptions: CombinationChoice.NONE()
        });

        underTest.selectResultCombination(optionOneId);
        let selectedResults = underTest.getSelectedResults();
        expect(selectedResults).toEqual(combinationOne);

        underTest.selectResultCombination(optionTwoId);
        selectedResults = underTest.getSelectedResults();
        expect(selectedResults).toEqual(combinationTwo);

    });

});
