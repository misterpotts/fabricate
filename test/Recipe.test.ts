import {expect, jest, test, beforeEach, describe} from "@jest/globals";
import {
    Recipe
} from "../src/scripts/crafting/recipe/Recipe";

import {
    testComponentOne,
    testComponentTwo,
    testComponentThree,
    testComponentFour,
    testComponentFive
} from "./test_data/TestCraftingComponents";
import {Combination} from "../src/scripts/common/Combination";
import {elementalEarth, elementalFire, elementalWater} from "./test_data/TestEssences";
import {
    testRecipeFive,
    testRecipeSix,
    testRecipeThree,
    testRecipeTwo
} from "./test_data/TestRecipes";
import {NoFabricateItemData} from "../src/scripts/foundry/DocumentManager";
import {SelectableOptions} from "../src/scripts/crafting/selection/SelectableOptions";
import {Unit} from "../src/scripts/common/Unit";
import {RequirementOption, RequirementOptionJson} from "../src/scripts/crafting/recipe/RequirementOption";
import {ResultOption, ResultOptionJson} from "../src/scripts/crafting/recipe/ResultOption";

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
        expect(underTest.hasRequirements).toEqual(false);
        expect(underTest.hasRequirementOptions).toEqual(false);
        expect(underTest.hasResults).toEqual(true);
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
        expect(underTest.hasRequirements).toEqual(true);
        expect(underTest.hasRequirementOptions).toEqual(false);
        expect(underTest.requirementOptions.options.length).toEqual(1);
        expect(underTest.requirementOptions.options[0].requiresCatalysts).toEqual(true);
        expect(underTest.requirementOptions.options[0].requiresIngredients).toEqual(false);
        expect(underTest.requirementOptions.options[0].catalysts.size).toEqual(1);
        expect(underTest.requirementOptions.options[0].catalysts.amountFor(testComponentFour.id)).toEqual(1);
        expect(underTest.hasResults).toEqual(true);
        expect(underTest.hasResultOptions).toEqual(false);
    });

    test("should correctly assess requirements for a recipe with named ingredients and catalysts", () => {
        const underTest = testRecipeTwo;

        expect(underTest.hasOptions).toEqual(false);
        expect(underTest.ready()).toEqual(true);
        expect(underTest.requiresEssences).toEqual(false);
        expect(underTest.hasRequirements).toEqual(true);
        expect(underTest.hasRequirementOptions).toEqual(false);
        expect(underTest.requirementOptions.options.length).toEqual(1);
        expect(underTest.requirementOptions.options[0].requiresCatalysts).toEqual(true);
        expect(underTest.requirementOptions.options[0].requiresIngredients).toEqual(true);
        expect(underTest.requirementOptions.options[0].catalysts.size).toEqual(1);
        expect(underTest.requirementOptions.options[0].catalysts.amountFor(testComponentFive.id)).toEqual(1);
        expect(underTest.requirementOptions.options[0].ingredients.size).toEqual(1);
        expect(underTest.requirementOptions.options[0].ingredients.amountFor(testComponentFour.id)).toEqual(1);
        expect(underTest.hasResults).toEqual(true);
        expect(underTest.hasResultOptions).toEqual(false);

    });

    test("should correctly assess requirements for a recipe with both essences and named ingredients", () => {
        const underTest = testRecipeSix;

        expect(underTest.hasOptions).toEqual(true);
        expect(underTest.ready()).toEqual(false);
        expect(underTest.requiresEssences).toEqual(true);
        expect(underTest.hasRequirements).toEqual(true);
        expect(underTest.hasRequirementOptions).toEqual(true);
        expect(underTest.hasResults).toEqual(true);
        expect(underTest.hasResultOptions).toEqual(true);
        expect(underTest.requirementOptions.options.length).toEqual(2);
        expect(underTest.resultOptions.options.length).toEqual(2);

    });

});

describe("When selecting ingredients", () => {

    const id = "hq4F67hS";

    test("should require choices from ingredient groups with options", () => {

        const combinationOne = Combination.ofUnits([
            new Unit(testComponentOne.toReference(), 1),
            new Unit(testComponentTwo.toReference(), 1)
        ]);

        const combinationTwo = Combination.ofUnits([
            new Unit(testComponentThree.toReference(), 2)
        ]);

        const underTest = new Recipe({
            id,
            craftingSystemId: "acb123",
            disabled: false,
            itemData: NoFabricateItemData.INSTANCE(),
            requirementOptions: new SelectableOptions<RequirementOptionJson, RequirementOption>({
                options: [
                    new RequirementOption({
                        name: "Option 1",
                        ingredients: combinationOne
                    }),
                    new RequirementOption({
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
            new Unit(testComponentOne.toReference(), 1),
            new Unit(testComponentTwo.toReference(), 1)
        ]);
        const optionOneId = "1";
        const optionOne = new RequirementOption({
            name: optionOneId,
            ingredients: combinationOne
        });

        const optionTwoId = "2";
        const combinationTwo = Combination.ofUnits([
            new Unit(testComponentThree.toReference(), 2)
        ]);
        const optionTwo = new RequirementOption({
            name: optionTwoId,
            ingredients: combinationTwo
        });

        const underTest = new Recipe({
            id,
            craftingSystemId: "acb123",
            itemData: NoFabricateItemData.INSTANCE(),
            requirementOptions: new SelectableOptions<RequirementOptionJson, RequirementOption>({
                options: [optionOne, optionTwo]
            })
        });

        expect(underTest.requirementOptions.options.length).toEqual(2);
        expect(underTest.ready()).toEqual(false);

        underTest.selectRequirementOption(optionOneId);
        expect(underTest.ready()).toEqual(true);

        let selectedIngredients = underTest.getSelectedIngredients();

        expect(selectedIngredients.ingredients.equals(combinationOne)).toEqual(true);

        underTest.selectRequirementOption(optionTwoId);
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
            new Unit(testComponentFive.toReference(), 3),
            new Unit(testComponentOne.toReference(), 1)
        ]);

        const singletonIngredient = Combination.ofUnits([
            new Unit(testComponentFour.toReference(), 2)
        ]);

        const underTest = new Recipe({
            id,
            craftingSystemId: "acb123",
            itemData: NoFabricateItemData.INSTANCE(),
            resultOptions: new SelectableOptions<ResultOptionJson, ResultOption>({
                options: [
                    new ResultOption({
                        name: "Option 1",
                        results: singletonResult
                    })
                ]
            }),
            requirementOptions: new SelectableOptions<RequirementOptionJson, RequirementOption>({
                options: [
                    new RequirementOption({
                        name: "Option 1",
                        ingredients: singletonIngredient
                    })
                ]
            })
        });

        const selectedResults = underTest.getSelectedResults().results;
        expect(selectedResults.size).toEqual(4);
        expect(selectedResults.amountFor(testComponentFive.id)).toEqual(3);
        expect(selectedResults.amountFor(testComponentOne.id)).toEqual(1);

        const selectedIngredients = underTest.getSelectedIngredients();
        expect(selectedIngredients.ingredients.size).toEqual(2);
        expect(selectedIngredients.ingredients.amountFor(testComponentFour.id)).toEqual(2);

    });

    test("should require choices from result groups with options", () => {

        const resultCombinationOne = Combination.ofUnits([
            new Unit(testComponentThree.toReference(), 2)
        ]);

        const resultCombinationTwo = Combination.ofUnits([
            new Unit(testComponentFour.toReference(), 2)
        ]);

        const underTest = new Recipe({
            id,
            craftingSystemId: "acb123",
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
            new Unit(testComponentOne.toReference(), 1),
            new Unit(testComponentTwo.toReference(), 1)
        ]);

        const resultCombinationTwo = Combination.ofUnits([
            new Unit(testComponentThree.toReference(), 2)
        ]);

        const optionOneId = "1";
        const optionTwoId = "2";
        const underTest = new Recipe({
            id,
            craftingSystemId: "acb123",
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

        underTest.selectResultOption(optionOneId);
        expect(underTest.ready()).toEqual(true);
        let selectedResults = underTest.getSelectedResults().results;
        expect(selectedResults).toEqual(resultCombinationOne);

        underTest.selectResultOption(optionTwoId);
        expect(underTest.ready()).toEqual(true);
        selectedResults = underTest.getSelectedResults().results;
        expect(selectedResults).toEqual(resultCombinationTwo);

        underTest.deselectResults();
        expect(underTest.ready()).toEqual(false);

    });

});
