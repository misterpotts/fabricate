import {describe, expect, test} from "@jest/globals";

import {PartDictionary, PartDictionaryFactory} from "../src/scripts/system/PartDictionary";
import {
    testComponentFive,
    testComponentFour,
    testComponentOne,
    testComponentThree,
    testComponentTwo
} from "./test_data/TestCraftingComponents";
import {
    testRecipeFive,
    testRecipeFour,
    testRecipeOne,
    testRecipeSeven,
    testRecipeSix,
    testRecipeThree,
    testRecipeTwo
} from "./test_data/TestRecipes";
import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./test_data/TestEssences";
import {EssenceJson} from "../src/scripts/common/Essence";
import {RecipeJson} from "../src/scripts/common/Recipe";
import {CraftingComponentJson} from "../src/scripts/common/CraftingComponent";
import {StubDocumentManager} from "./stubs/StubDocumentManager";
import {LoadedFabricateItemData} from "../src/scripts/foundry/DocumentManager";

describe("Create", () => {

    test("Should construct empty Part Dictionary", () => {
        const underTest: PartDictionary = new PartDictionaryFactory({})
            .make({
                essences: {},
                recipes: {},
                components: {}
            });

        expect(underTest).not.toBeNull();
        expect(underTest.size).toBe(0);
        const id = "NOT_A_VALID_ID";
        expect(underTest.hasEssence(id)).toBe(false);
        expect(underTest.hasComponent(id)).toBe(false);
        expect(underTest.hasRecipe(id)).toBe(false);

        const asJson = underTest.toJson();
        expect(Object.keys(asJson.essences).length).toEqual(0);
        expect(Object.keys(asJson.recipes).length).toEqual(0);
        expect(Object.keys(asJson.components).length).toEqual(0);
    });

});

describe("Index and Retrieve", () => {

    function rawEssenceData() {
        const essences: Record<string, EssenceJson> = {};
        essences[elementalFire.id] = elementalFire.toJson();
        essences[elementalEarth.id] = elementalEarth.toJson();
        essences[elementalWater.id] = elementalWater.toJson();
        essences[elementalAir.id] = elementalAir.toJson();
        return essences;
    }

    function rawRecipeData() {
        const recipes: Record<string, RecipeJson> = {};
        recipes[testRecipeOne.id] = testRecipeOne.toJson();
        recipes[testRecipeTwo.id] = testRecipeTwo.toJson();
        recipes[testRecipeThree.id] = testRecipeThree.toJson();
        recipes[testRecipeFour.id] = testRecipeFour.toJson();
        recipes[testRecipeFive.id] = testRecipeFive.toJson();
        recipes[testRecipeSix.id] = testRecipeSix.toJson();
        recipes[testRecipeSeven.id] = testRecipeSeven.toJson();
        return recipes;
    }

    function rawComponentData() {
        const components: Record<string, CraftingComponentJson> = {};
        components[testComponentOne.id] = testComponentOne.toJson();
        components[testComponentTwo.id] = testComponentTwo.toJson();
        components[testComponentThree.id] = testComponentThree.toJson();
        components[testComponentFour.id] = testComponentFour.toJson();
        components[testComponentFive.id] = testComponentFive.toJson();
        return components;
    }

    const stubItemName = "Item name";
    const stubItemImageUrl = "/img/url.ext";
    const stubItemSource = {};
    const recipeUuids = Object.values(rawRecipeData()).map(recipeData => recipeData.itemUuid);
    const componentUuids = Object.values(rawComponentData()).map(componentData => componentData.itemUuid);
    const allItemUuids = componentUuids.concat(recipeUuids);
    const itemData = new Map(
        allItemUuids
            .map(id => [id, new LoadedFabricateItemData({
                name: stubItemName,
                imageUrl: stubItemImageUrl,
                itemUuid: id,
                sourceDocument: stubItemSource
            })])
    );
    const stubDocumentManager = new StubDocumentManager(itemData);

    test.skip("Should delete invalid components when loading fails", async () => {

        const poisonDocumentManager = new StubDocumentManager(itemData);
        poisonDocumentManager.poison(testComponentThree.id);

        const underTest: PartDictionary = new PartDictionaryFactory({ documentManager: poisonDocumentManager })
            .make({
                essences: rawEssenceData(),
                recipes: rawRecipeData(),
                components: rawComponentData()
            });

        await underTest.loadAll();

        expect(underTest.size).toBe(15);

    });

    test("Should load a populated Part Dictionary from source data", async () => {

        const essences = rawEssenceData();
        const underTest: PartDictionary = new PartDictionaryFactory({documentManager: stubDocumentManager})
            .make({
                essences: essences,
                recipes: rawRecipeData(),
                components: rawComponentData()
            });

        expect(underTest).not.toBeNull();
        await underTest.loadAll();

        expect(underTest.size).toBe(16);

        Object.keys(essences).forEach(id => expect(underTest.hasEssence(id)).toEqual(true));

        const loadedComponents = underTest.getComponents();
        loadedComponents.forEach(component => {
            expect(underTest.hasComponent(component.id)).toEqual(true);
            expect(component.name).toEqual(stubItemName);
            expect(component.imageUrl).toEqual(stubItemImageUrl);
            expect(componentUuids).toEqual(expect.arrayContaining([component.itemUuid]));
        });

        const loadedRecipes = await underTest.getRecipes();
        loadedRecipes.forEach(recipe => {
            expect(underTest.hasRecipe(recipe.id)).toEqual(true);
            expect(recipe.name).toEqual(stubItemName);
            expect(recipe.imageUrl).toEqual(stubItemImageUrl);
            expect(recipeUuids).toEqual(expect.arrayContaining([recipe.itemUuid]));
        })
    });

    test("Should delete and dereference components from recipes and salvage", async () => {

        const underTest: PartDictionary = new PartDictionaryFactory({documentManager: stubDocumentManager})
            .make({
                essences: rawEssenceData(),
                recipes: rawRecipeData(),
                components: rawComponentData()
            });

        expect(underTest).not.toBeNull();

        await underTest.loadAll();
        expect(underTest.size).toBe(16);

        const componentToDelete = testComponentThree;
        const componentIdToDelete = componentToDelete.id;

        underTest.deleteComponentById(componentIdToDelete);

        expect(underTest.size).toBe(15);

        const recipes = await underTest.getRecipes();

        recipes.forEach(recipe => {
            recipe.ingredientOptions.forEach(option => {
                expect(option.catalysts.has(componentToDelete)).toEqual(false);
                expect(option.ingredients.has(componentToDelete)).toEqual(false);
            });
            recipe.resultOptions.forEach(option => {
                expect(option.results.has(componentToDelete)).toEqual(false);
            });
        });

        const components = underTest.getComponents();
        expect(components.find(component => component.id === componentIdToDelete)).toBeUndefined();
        components.forEach(component => {
            expect(component.salvageOptions.find(option => option.salvage.has(componentToDelete))).toBeUndefined();
        });

        const asJson = underTest.toJson();
        expect(Object.keys(asJson.components).length).toEqual(4);
        expect(asJson.components[componentIdToDelete]).toBeUndefined();

    });

    test("Should delete and dereference essences from recipes and components", async () => {

        const underTest: PartDictionary = new PartDictionaryFactory({documentManager: stubDocumentManager})
            .make({
                essences: rawEssenceData(),
                recipes: rawRecipeData(),
                components: rawComponentData()
            });

        expect(underTest).not.toBeNull();

        await underTest.loadAll();
        expect(underTest.size).toBe(16);

        const essenceToDelete = elementalFire;
        const essenceIdToDelete = essenceToDelete.id;

        await underTest.deleteEssenceById(essenceIdToDelete);

        expect(underTest.size).toBe(15);

        const recipes = await underTest.getRecipes();

        recipes.forEach(recipe => {
            expect(recipe.essences.has(essenceToDelete)).toEqual(false);
        });

        const components = await underTest.getComponents();
        components.forEach(component => {
            expect(component.essences.has(essenceToDelete)).toEqual(false);
        });

        const essences = await underTest.getEssences();
        expect(new Map(essences.map(essence => [essence.id, essence])).has(essenceIdToDelete)).toEqual(false);

        const asJson = underTest.toJson();
        expect(Object.keys(asJson.essences).length).toEqual(3);
        expect(asJson.essences[essenceIdToDelete]).toBeUndefined();

    });

    test("Should add and Get Recipes and Components", async () => {
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

        await expect(underTest.getEssence(elementalFire.id)).toEqual(elementalFire);
        await expect(underTest.getEssence(elementalEarth.id)).toEqual(elementalEarth);
        await expect(underTest.getEssence(elementalAir.id)).toEqual(elementalAir);
        await expect(underTest.getEssence(elementalWater.id)).toEqual(elementalWater);

        await expect(underTest.getComponent(testComponentOne.id)).toEqual(testComponentOne);
        await expect(underTest.getComponent(testComponentTwo.id)).toEqual(testComponentTwo);
        await expect(underTest.getComponent(testComponentThree.id)).toEqual(testComponentThree);
        await expect(underTest.getComponent(testComponentFour.id)).toEqual(testComponentFour);
        await expect(underTest.getComponent(testComponentFive.id)).toEqual(testComponentFive);

        await expect(underTest.getRecipe(testRecipeOne.id)).toEqual(testRecipeOne);
        await expect(underTest.getRecipe(testRecipeTwo.id)).toEqual(testRecipeTwo);
        await expect(underTest.getRecipe(testRecipeThree.id)).toEqual(testRecipeThree);
        await expect(underTest.getRecipe(testRecipeFour.id)).toEqual(testRecipeFour);
    });

    test("Should throw errors when parts are not found", async () => {

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

        const id: string = "notAValidId";
        await expect(() => underTest.getComponent(id)).toThrow(new Error(`No Component data was found for the id "${id}". Known Component IDs for this system are: iyeUGBbSts0ij92X, tdyV4AWuTMkXbepw, Ra2Z1ujre76weR0i`));
        await expect(() => underTest.getRecipe(id)).toThrow(new Error(`No Recipe data was found for the id "${id}". Known Recipe IDs for this system are: z2ixo2m312l`));

    });

});