import {beforeEach, describe, expect, test} from "@jest/globals";
import * as Sinon from "sinon";

import {PartDictionary, PartDictionaryFactory} from "../src/scripts/system/PartDictionary";
import {testComponentFive, testComponentFour, testComponentOne, testComponentThree, testComponentTwo} from "./test_data/TestCraftingComponents";
import {testRecipeFour, testRecipeOne, testRecipeThree, testRecipeTwo} from "./test_data/TestRecipes";
import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./test_data/TestEssences";

const Sandbox: Sinon.SinonSandbox = Sinon.createSandbox();

beforeEach(() => {
    Sandbox.reset();
});

describe('Create', () => {

    test('Should construct empty Part Dictionary', () => {
        const underTest: PartDictionary = new PartDictionaryFactory({})
            .make({
                essences: {},
                recipes: {},
                components: {}
            });

        expect(underTest).not.toBeNull();
        expect(underTest.size).toBe(0);
    });

});

describe('Index and Retrieve', () => {

    test('Should add and Get Recipes and Components', async () => {
        const underTest: PartDictionary = new PartDictionaryFactory({})
            .make({
                essences: {},
                recipes: {},
                components: {}
            });

        await underTest.insertEssence(elementalFire);
        await underTest.insertEssence(elementalEarth);
        await underTest.insertEssence(elementalAir);
        await underTest.insertEssence(elementalWater);

        await underTest.insertComponent(testComponentOne);
        await underTest.insertComponent(testComponentTwo);
        await underTest.insertComponent(testComponentThree);
        await underTest.insertComponent(testComponentFour);
        await underTest.insertComponent(testComponentFive);

        await underTest.insertRecipe(testRecipeOne);
        await underTest.insertRecipe(testRecipeTwo);
        await underTest.insertRecipe(testRecipeThree);
        await underTest.insertRecipe(testRecipeFour);

        expect(underTest).not.toBeNull();
        expect(underTest.size).toBe(13);

        await expect(underTest.getEssence(elementalFire.id)).resolves.toEqual(elementalFire);
        await expect(underTest.getEssence(elementalEarth.id)).resolves.toEqual(elementalEarth);
        await expect(underTest.getEssence(elementalAir.id)).resolves.toEqual(elementalAir);
        await expect(underTest.getEssence(elementalWater.id)).resolves.toEqual(elementalWater);

        await expect(underTest.getComponent(testComponentOne.id)).resolves.toEqual(testComponentOne);
        await expect(underTest.getComponent(testComponentTwo.id)).resolves.toEqual(testComponentTwo);
        await expect(underTest.getComponent(testComponentThree.id)).resolves.toEqual(testComponentThree);
        await expect(underTest.getComponent(testComponentFour.id)).resolves.toEqual(testComponentFour);
        await expect(underTest.getComponent(testComponentFive.id)).resolves.toEqual(testComponentFive);

        await expect(underTest.getRecipe(testRecipeOne.id)).resolves.toEqual(testRecipeOne);
        await expect(underTest.getRecipe(testRecipeTwo.id)).resolves.toEqual(testRecipeTwo);
        await expect(underTest.getRecipe(testRecipeThree.id)).resolves.toEqual(testRecipeThree);
        await expect(underTest.getRecipe(testRecipeFour.id)).resolves.toEqual(testRecipeFour);
    });

    test('Should throw errors when parts are not found', async () => {

        const underTest: PartDictionary = new PartDictionaryFactory({})
            .make({
                essences: {},
                recipes: {},
                components: {}
            });

        await underTest.insertComponent(testComponentOne);
        await underTest.insertComponent(testComponentThree);
        await underTest.insertComponent(testComponentFour);

        await underTest.insertRecipe(testRecipeOne);

        expect(underTest).not.toBeNull();
        expect(underTest.size).toBe(4);

        const id: string = 'notAValidId';
        await expect(underTest.getComponent(id)).rejects.toThrow(new Error(`No Component data was found for the id "${id}". Known Component IDs for this system are: `));
        await expect(underTest.getRecipe(id)).rejects.toThrow(new Error(`No Recipe data was found for the id "${id}". Known Recipe IDs for this system are: `));

    });

});