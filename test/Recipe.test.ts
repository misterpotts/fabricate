import {expect, jest, test, beforeEach, describe} from "@jest/globals";
import {
    testComponentOne,
    testComponentTwo,
    testComponentFour,
    testComponentFive
} from "./test_data/TestCraftingComponents";
import {elementalEarth, elementalFire, elementalWater} from "./test_data/TestEssences";
import {
    testRecipeFive, testRecipeFour, testRecipeOne, testRecipeSeven,
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

        expect(underTest.hasChoices).toEqual(false);
        expect(underTest.hasRequirements).toEqual(true);
        expect(underTest.requirementOptions.all[0].essences.size).toEqual(4);
        expect(underTest.requirementOptions.all[0].essences.amountFor(elementalFire.id)).toEqual(1);
        expect(underTest.requirementOptions.all[0].essences.amountFor(elementalEarth.id)).toEqual(3);
        expect(underTest.hasRequirementChoices).toEqual(false);
        expect(underTest.hasResults).toEqual(true);
        expect(underTest.hasResultChoices).toEqual(false);
    });

    test("should correctly assess requirements for a recipe with essences and catalysts", () => {
        const underTest = testRecipeFive;

        expect(underTest.hasChoices).toEqual(false);
        expect(underTest.hasRequirements).toEqual(true);
        expect(underTest.hasRequirementChoices).toEqual(false);
        expect(underTest.requirementOptions.all.length).toEqual(1);
        expect(underTest.requirementOptions.all[0].requiresCatalysts).toEqual(true);
        expect(underTest.requirementOptions.all[0].requiresIngredients).toEqual(false);
        expect(underTest.requirementOptions.all[0].requiresEssences).toEqual(true);
        expect(underTest.requirementOptions.all[0].essences.size).toEqual(2);
        expect(underTest.requirementOptions.all[0].essences.amountFor(elementalFire.id)).toEqual(1);
        expect(underTest.requirementOptions.all[0].essences.amountFor(elementalWater.id)).toEqual(1);
        expect(underTest.requirementOptions.all[0].catalysts.size).toEqual(1);
        expect(underTest.requirementOptions.all[0].catalysts.amountFor(testComponentFour.id)).toEqual(1);
        expect(underTest.hasResults).toEqual(true);
        expect(underTest.hasResultChoices).toEqual(false);
    });

    test("should correctly assess requirements for a recipe with named ingredients and catalysts", () => {
        const underTest = testRecipeTwo;

        expect(underTest.hasChoices).toEqual(false);
        expect(underTest.hasRequirements).toEqual(true);
        expect(underTest.hasRequirementChoices).toEqual(false);
        expect(underTest.requirementOptions.all.length).toEqual(1);
        expect(underTest.requirementOptions.all[0].requiresCatalysts).toEqual(true);
        expect(underTest.requirementOptions.all[0].requiresIngredients).toEqual(true);
        expect(underTest.requirementOptions.all[0].catalysts.size).toEqual(1);
        expect(underTest.requirementOptions.all[0].catalysts.amountFor(testComponentFive.id)).toEqual(1);
        expect(underTest.requirementOptions.all[0].ingredients.size).toEqual(1);
        expect(underTest.requirementOptions.all[0].ingredients.amountFor(testComponentFour.id)).toEqual(1);
        expect(underTest.hasResults).toEqual(true);
        expect(underTest.hasResultChoices).toEqual(false);

    });

    test("should correctly assess requirements for a recipe with both essences and named ingredients", () => {
        const underTest = testRecipeSix;

        expect(underTest.hasChoices).toEqual(true);
        expect(underTest.hasRequirements).toEqual(true);
        expect(underTest.hasRequirementChoices).toEqual(true);
        expect(underTest.hasResults).toEqual(true);
        expect(underTest.hasResultChoices).toEqual(true);
        expect(underTest.requirementOptions.all.length).toEqual(2);
        expect(underTest.resultOptions.all.length).toEqual(2);

    });

});

describe("when describing a recipe", () => {

    test("should correctly list the unique referenced essences for a recipe with no options with essences", () => {

        const result = testRecipeOne.getUniqueReferencedEssences();
        expect(result).not.toBeNull();
        expect(result.length).toEqual(0);

    });

    test("should correctly list the unique referenced essences for a recipe with one option with essences", () => {

        const result = testRecipeFour.getUniqueReferencedEssences();
        expect(result).not.toBeNull();
        expect(result.length).toEqual(2);
        expect(result).toEqual(expect.arrayContaining([elementalWater.toReference(), elementalEarth.toReference()]));

    });

    test("should correctly list the unique referenced essences for a recipe with two options with essences", () => {

        const result = testRecipeSix.getUniqueReferencedEssences();
        expect(result).not.toBeNull();
        expect(result.length).toEqual(2);
        expect(result).toEqual(expect.arrayContaining([elementalWater.toReference(), elementalEarth.toReference()]));

    });

    test("should correctly list the unique referenced components for a recipe with no options with components", () => {

        const result = testRecipeThree.getUniqueReferencedComponents();
        expect(result).not.toBeNull();
        expect(result.length).toEqual(1);
        expect(result).toEqual(expect.arrayContaining([testComponentOne.toReference()]));

    });

    test("should correctly list the unique referenced components for a recipe with one option with catalysts", () => {

        const result = testRecipeFive.getUniqueReferencedComponents();
        expect(result).not.toBeNull();
        expect(result.length).toEqual(2);
        expect(result).toEqual(expect.arrayContaining([testComponentFour.toReference(), testComponentFive.toReference()]));


    });

    test("should correctly list the unique referenced components for a recipe with one option with ingredients", () => {

        const result = testRecipeSeven.getUniqueReferencedComponents();
        expect(result).not.toBeNull();
        expect(result.length).toEqual(2);
        expect(result).toEqual(expect.arrayContaining([testComponentFour.toReference(), testComponentTwo.toReference()]));


    });

});
