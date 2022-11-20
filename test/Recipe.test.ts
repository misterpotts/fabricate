import {expect, jest, test, beforeEach} from "@jest/globals";
import {CombinationChoice, Recipe} from "../src/scripts/crafting/Recipe";

import {
    testComponentOne,
    testComponentTwo,
    testComponentThree,
    testComponentFour,
    testComponentFive
} from "./test_data/TestCraftingComponents";
import {StringIdentity, Combination, Unit} from "../src/scripts/common/Combination";
import {elementalEarth, elementalFire, elementalWater} from "./test_data/TestEssenceDefinitions";
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

        expect(underTest.essences.size()).toEqual(4);
        expect(underTest.essences.amountFor(new StringIdentity(elementalFire.id))).toEqual(1);
        expect(underTest.essences.amountFor(new StringIdentity(elementalEarth.id))).toEqual(3);

        expect(underTest.hasOptions()).toEqual(false);
        expect(underTest.ready()).toEqual(true);
        expect(underTest.requiresEssences()).toEqual(true);
        expect(underTest.hasIngredients()).toEqual(false);
        expect(underTest.requiresCatalysts()).toEqual(false);
        expect(underTest.requiresNamedComponents()).toEqual(false);
    });

    test("should correctly assess requirements for a recipe with essences and catalysts", () => {
        const underTest = testRecipeFive;

        expect(underTest.catalysts.size()).toEqual(1);
        expect(underTest.catalysts.amountFor(new StringIdentity(testComponentFour.id))).toEqual(1);
        expect(underTest.essences.size()).toEqual(2);
        expect(underTest.essences.amountFor(new StringIdentity(elementalFire.id))).toEqual(1);
        expect(underTest.essences.amountFor(new StringIdentity(elementalWater.id))).toEqual(1);

        expect(underTest.hasOptions()).toEqual(false);
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

        expect(underTest.hasOptions()).toEqual(false);
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
        expect(underTest.catalysts.size()).toEqual(1);

        expect(underTest.hasOptions()).toEqual(false);
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
        expect(underTest.essences.size()).toEqual(4);

        expect(underTest.hasOptions()).toEqual(true);
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
            new Unit(new StringIdentity(testComponentOne.id), 1),
            new Unit(new StringIdentity(testComponentTwo.id), 1)
        ]);

        const combinationTwo = Combination.ofUnits([
            new Unit(new StringIdentity(testComponentThree.id), 2)
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
            new Unit(new StringIdentity(testComponentOne.id), 1),
            new Unit(new StringIdentity(testComponentTwo.id), 1)
        ]);

        const combinationTwo = Combination.ofUnits([
            new Unit(new StringIdentity(testComponentThree.id), 2)
        ]);

        const underTest = new Recipe({
            id,
            name: "Test Recipe",
            ingredientOptions: CombinationChoice.between(combinationOne, combinationTwo),
            resultOptions: CombinationChoice.NONE()
        });

        expect(underTest.ingredientOptions.size).toEqual(2);
        expect(underTest.ready()).toEqual(false);

        underTest.selectIngredientCombination(combinationOne.id);
        expect(underTest.ready()).toEqual(true);

        let selectedIngredients = underTest.getSelectedIngredients();

        expect(selectedIngredients.id).toEqual(combinationOne.id);
        expect(selectedIngredients.equals(combinationOne)).toEqual(true);
        expect(combinationOne.equals(selectedIngredients)).toEqual(true);

        underTest.selectIngredientCombination(combinationTwo.id);
        expect(underTest.ready()).toEqual(true);

        selectedIngredients = underTest.getSelectedIngredients();

        expect(selectedIngredients.id).toEqual(combinationTwo.id);
        expect(selectedIngredients.equals(combinationTwo)).toEqual(true);
        expect(combinationTwo.equals(selectedIngredients)).toEqual(true);
    });

});

describe("When selecting results", () => {

    const id = "hq4F67hS";

    test("should not require choice when there is only one option", () => {

        const singletonResult = Combination.ofUnits([
            new Unit(new StringIdentity(testComponentFive.id), 3),
            new Unit(new StringIdentity(testComponentOne.id), 1)
        ]);

        const singletonIngredient = Combination.ofUnits([
            new Unit(new StringIdentity(testComponentFour.id), 2)
        ]);

        const underTest = new Recipe({
            id,
            name: "Test Recipe",
            resultOptions: CombinationChoice.just(singletonResult),
            ingredientOptions: CombinationChoice.just(singletonIngredient)
        });

        const selectedResults = underTest.getSelectedResults();
        expect(selectedResults.id).toEqual(singletonResult.id);
        expect(selectedResults.size()).toEqual(4);
        expect(selectedResults.amountFor(new StringIdentity(testComponentFive.id))).toEqual(3);
        expect(selectedResults.amountFor(new StringIdentity(testComponentOne.id))).toEqual(1);

        const selectedIngredients = underTest.getSelectedIngredients();
        expect(selectedIngredients.id).toEqual(singletonIngredient.id);
        expect(selectedIngredients.size()).toEqual(2);
        expect(selectedIngredients.amountFor(new StringIdentity(testComponentFour.id))).toEqual(2);

    });

    test("should require choices from result groups with options", () => {

        const ingredientCombinationOne = Combination.ofUnits([
            new Unit(new StringIdentity(testComponentOne.id), 1),
            new Unit(new StringIdentity(testComponentTwo.id), 1)
        ]);

        const ingredientCombinationTwo = Combination.ofUnits([
            new Unit(new StringIdentity(testComponentThree.id), 2)
        ]);

        const resultCombination = Combination.ofUnits([
            new Unit(new StringIdentity(testComponentFour.id), 2)
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
            new Unit(new StringIdentity(testComponentOne.id), 1),
            new Unit(new StringIdentity(testComponentTwo.id), 1)
        ]);

        const combinationTwo = Combination.ofUnits([
            new Unit(new StringIdentity(testComponentThree.id), 2)
        ]);

        const underTest = new Recipe({
            id,
            name: "Test Recipe",
            resultOptions: CombinationChoice.between(combinationOne, combinationTwo),
            ingredientOptions: CombinationChoice.NONE()
        });

        underTest.selectResultCombination(combinationOne.id);
        let selectedResults = underTest.getSelectedResults();
        expect(selectedResults.id).toEqual(combinationOne.id);

        underTest.selectResultCombination(combinationTwo.id);
        selectedResults = underTest.getSelectedResults();
        expect(selectedResults.id).toEqual(combinationTwo.id);

    });

});
