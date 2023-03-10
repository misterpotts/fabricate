import {expect, jest, test, beforeEach, describe} from "@jest/globals";
import {
    IngredientOption,
    IngredientOptionJson,
    Recipe, ResultOption, ResultOptionJson
} from "../src/scripts/common/Recipe";

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
    testRecipeSix,
    testRecipeThree,
    testRecipeTwo
} from "./test_data/TestRecipes";
import {NoFabricateItemData} from "../src/scripts/foundry/DocumentManager";
import {SelectableOptions} from "../src/scripts/common/SelectableOptions";

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
        expect(underTest.requiresEssences).toEqual(true);
        expect(underTest.hasIngredients).toEqual(false);
        expect(underTest.hasIngredientOptions).toEqual(false);
        expect(underTest.hasResults()).toEqual(true);
        expect(underTest.hasResultOptions).toEqual(false);
    });

    test("should correctly assess requirements for a recipe with essences and catalysts", () => {
        const underTest = testRecipeFive;

        expect(underTest.essences.size).toEqual(2);
        expect(underTest.essences.amountFor(elementalFire.id)).toEqual(1);
        expect(underTest.essences.amountFor(elementalWater.id)).toEqual(1);

        expect(underTest.hasOptions).toEqual(false);
        expect(underTest.ready()).toEqual(true);
        expect(underTest.requiresEssences).toEqual(true);
        expect(underTest.hasIngredients).toEqual(true);
        expect(underTest.hasIngredientOptions).toEqual(false);
        expect(underTest.ingredientOptions.length).toEqual(1);
        expect(underTest.ingredientOptions[0].requiresCatalysts).toEqual(true);
        expect(underTest.ingredientOptions[0].requiresIngredients).toEqual(false);
        expect(underTest.ingredientOptions[0].catalysts.size).toEqual(1);
        expect(underTest.ingredientOptions[0].catalysts.amountFor(testComponentFour.id)).toEqual(1);
        expect(underTest.hasResults()).toEqual(true);
        expect(underTest.hasResultOptions).toEqual(false);
    });

    test("should correctly assess requirements for a recipe with named ingredients and catalysts", () => {
        const underTest = testRecipeTwo;

        expect(underTest.hasOptions).toEqual(false);
        expect(underTest.ready()).toEqual(true);
        expect(underTest.requiresEssences).toEqual(false);
        expect(underTest.hasIngredients).toEqual(true);
        expect(underTest.hasIngredientOptions).toEqual(false);
        expect(underTest.ingredientOptions.length).toEqual(1);
        expect(underTest.ingredientOptions[0].requiresCatalysts).toEqual(true);
        expect(underTest.ingredientOptions[0].requiresIngredients).toEqual(true);
        expect(underTest.ingredientOptions[0].catalysts.size).toEqual(1);
        expect(underTest.ingredientOptions[0].catalysts.amountFor(testComponentFive.id)).toEqual(1);
        expect(underTest.ingredientOptions[0].ingredients.size).toEqual(1);
        expect(underTest.ingredientOptions[0].ingredients.amountFor(testComponentFour.id)).toEqual(1);
        expect(underTest.hasResults()).toEqual(true);
        expect(underTest.hasResultOptions).toEqual(false);

    });

    test("should correctly assess requirements for a recipe with both essences and named ingredients", () => {
        const underTest = testRecipeSix;

        expect(underTest.hasOptions).toEqual(true);
        expect(underTest.ready()).toEqual(false);
        expect(underTest.requiresEssences).toEqual(true);
        expect(underTest.hasIngredients).toEqual(true);
        expect(underTest.hasIngredientOptions).toEqual(true);
        expect(underTest.hasResults()).toEqual(true);
        expect(underTest.hasResultOptions).toEqual(true);
        expect(underTest.ingredientOptions.length).toEqual(2);
        expect(underTest.resultOptions.length).toEqual(2);

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
            disabled: false,
            itemData: NoFabricateItemData.INSTANCE(),
            ingredientOptions: new SelectableOptions<IngredientOptionJson, IngredientOption>({
                options: [
                    new IngredientOption({
                        name: "Option 1",
                        ingredients: combinationOne
                    }),
                    new IngredientOption({
                        name: "Option 2",
                        ingredients: combinationTwo
                    }),
                ]
            })
        });

        expect(underTest.ready()).toEqual(false);

        expect(underTest.getSelectedIngredients).toThrow(Error);

    });

    test("should produce the correct selected ingredients when components in an ingredient group are re-selected", () => {

        const combinationOne = Combination.ofUnits([
            new Unit(testComponentOne, 1),
            new Unit(testComponentTwo, 1)
        ]);
        const optionOneId = "1";
        const optionOne = new IngredientOption({
            name: optionOneId,
            ingredients: combinationOne
        });

        const optionTwoId = "2";
        const combinationTwo = Combination.ofUnits([
            new Unit(testComponentThree, 2)
        ]);
        const optionTwo = new IngredientOption({
            name: optionTwoId,
            ingredients: combinationTwo
        });

        const underTest = new Recipe({
            id,
            itemData: NoFabricateItemData.INSTANCE(),
            ingredientOptions: new SelectableOptions<IngredientOptionJson, IngredientOption>({
                options: [optionOne, optionTwo]
            })
        });

        expect(underTest.ingredientOptions.length).toEqual(2);
        expect(underTest.ready()).toEqual(false);

        underTest.selectIngredientCombination(optionOneId);
        expect(underTest.ready()).toEqual(true);

        let selectedIngredients = underTest.getSelectedIngredients();

        expect(selectedIngredients.ingredients.equals(combinationOne)).toEqual(true);

        underTest.selectIngredientCombination(optionTwoId);
        expect(underTest.ready()).toEqual(true);

        selectedIngredients = underTest.getSelectedIngredients();

        expect(selectedIngredients.ingredients.equals(combinationTwo)).toEqual(true);

        underTest.deselectIngredients();
        expect(underTest.ready()).toEqual(false);
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
            itemData: NoFabricateItemData.INSTANCE(),
            resultOptions: new SelectableOptions<ResultOptionJson, ResultOption>({
                options: [
                    new ResultOption({
                        name: "Option 1",
                        results: singletonResult
                    })
                ]
            }),
            ingredientOptions: new SelectableOptions<IngredientOptionJson, IngredientOption>({
                options: [
                    new IngredientOption({
                        name: "Option 1",
                        ingredients: singletonIngredient
                    })
                ]
            })
        });

        const selectedResults = underTest.getSelectedResults();
        expect(selectedResults.size).toEqual(4);
        expect(selectedResults.amountFor(testComponentFive.id)).toEqual(3);
        expect(selectedResults.amountFor(testComponentOne.id)).toEqual(1);

        const selectedIngredients = underTest.getSelectedIngredients();
        expect(selectedIngredients.ingredients.size).toEqual(2);
        expect(selectedIngredients.ingredients.amountFor(testComponentFour.id)).toEqual(2);

    });

    test("should require choices from result groups with options", () => {

        const resultCombinationOne = Combination.ofUnits([
            new Unit(testComponentThree, 2)
        ]);

        const resultCombinationTwo = Combination.ofUnits([
            new Unit(testComponentFour, 2)
        ]);

        const underTest = new Recipe({
            id,
            itemData: NoFabricateItemData.INSTANCE(),
            resultOptions: new SelectableOptions<ResultOptionJson, ResultOption>({
                options: [
                    new ResultOption({
                        name: "Option 1",
                        results: resultCombinationOne
                    }),
                    new ResultOption({
                        name: "Option 2",
                        results: resultCombinationTwo
                    })
                ]
            })
        });

        expect(underTest.ready()).toEqual(false);

        expect(underTest.getSelectedResults).toThrow(Error);

    });

    test("should produce the correct selected results when components in a result group are re-selected", () => {

        const resultCombinationOne = Combination.ofUnits([
            new Unit(testComponentOne, 1),
            new Unit(testComponentTwo, 1)
        ]);

        const resultCombinationTwo = Combination.ofUnits([
            new Unit(testComponentThree, 2)
        ]);

        const optionOneId = "1";
        const optionTwoId = "2";
        const underTest = new Recipe({
            id,
            itemData: NoFabricateItemData.INSTANCE(),
            resultOptions: new SelectableOptions<ResultOptionJson, ResultOption>({
                options: [
                    new ResultOption({
                        name: optionOneId,
                        results: resultCombinationOne
                    }),
                    new ResultOption({
                        name: optionTwoId,
                        results: resultCombinationTwo
                    })
                ]
            })
        });

        expect(underTest.ready()).toEqual(false);

        underTest.selectResultCombination(optionOneId);
        expect(underTest.ready()).toEqual(true);
        let selectedResults = underTest.getSelectedResults();
        expect(selectedResults).toEqual(resultCombinationOne);

        underTest.selectResultCombination(optionTwoId);
        expect(underTest.ready()).toEqual(true);
        selectedResults = underTest.getSelectedResults();
        expect(selectedResults).toEqual(resultCombinationTwo);

        underTest.deselectResults();
        expect(underTest.ready()).toEqual(false);

    });

});
