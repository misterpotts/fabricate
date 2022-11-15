import {beforeEach, describe, expect, test} from "@jest/globals";
import * as Sinon from "sinon";

import {PartDictionary} from "../src/scripts/system/PartDictionary";
import {testComponentFive, testComponentFour, testComponentOne, testComponentThree, testComponentTwo} from "./test_data/TestCraftingComponents";
import {testRecipeFour, testRecipeOne, testRecipeThree, testRecipeTwo} from "./test_data/TestRecipes";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

beforeEach(() => {
    Sandbox.reset();
});

describe('Create', () => {

    test('Should construct empty Part Dictionary', () => {
        const underTest: PartDictionary = new PartDictionary({});

        expect(underTest).not.toBeNull();
        expect(underTest.size()).toBe(0);
    });

});

describe('Index and Retrieve', () => {

    test('Should add and Get Recipes and Components', () => {
        const underTest: PartDictionary = new PartDictionary({});

        underTest.addComponent(testComponentOne);
        underTest.addComponent(testComponentTwo);
        underTest.addComponent(testComponentThree);
        underTest.addComponent(testComponentFour);
        underTest.addComponent(testComponentFive);

        underTest.addRecipe(testRecipeOne);
        underTest.addRecipe(testRecipeTwo);
        underTest.addRecipe(testRecipeThree);
        underTest.addRecipe(testRecipeFour);

        expect(underTest).not.toBeNull();
        expect(underTest.size()).toBe(9);

        expect(underTest.getComponent(testComponentOne.id)).toBe(testComponentOne);
        expect(underTest.getComponent(testComponentTwo.id)).toBe(testComponentTwo);
        expect(underTest.getComponent(testComponentThree.id)).toBe(testComponentThree);
        expect(underTest.getComponent(testComponentFour.id)).toBe(testComponentFour);
        expect(underTest.getComponent(testComponentFive.id)).toBe(testComponentFive);

        expect(underTest.getRecipe(testRecipeOne.id)).toBe(testRecipeOne);
        expect(underTest.getRecipe(testRecipeTwo.id)).toBe(testRecipeTwo);
        expect(underTest.getRecipe(testRecipeThree.id)).toBe(testRecipeThree);
        expect(underTest.getRecipe(testRecipeFour.id)).toBe(testRecipeFour);
    });

    test('Should throw errors when parts are not found', () => {

        const underTest: PartDictionary = new PartDictionary({});

        underTest.addComponent(testComponentOne);
        underTest.addComponent(testComponentThree);
        underTest.addComponent(testComponentFour);

        underTest.addRecipe(testRecipeOne);

        expect(underTest).not.toBeNull();
        expect(underTest.size()).toBe(4);

        const id: string = 'notAValidId';
        expect(() => underTest.getComponent(id)).toThrow(new Error(`No Component was found with the identifier ${id}. `));
        expect(() => underTest.getRecipe(id)).toThrow(new Error(`No Recipe was found with the identifier ${id}. `));

    });

});