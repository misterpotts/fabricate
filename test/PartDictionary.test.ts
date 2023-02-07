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
import {RecipeJson} from "../src/scripts/crafting/Recipe";
import {CraftingComponentJson} from "../src/scripts/common/CraftingComponent";
import {StubDocumentManager} from "./stubs/StubDocumentManager";
import {FabricateItemData} from "../src/scripts/foundry/DocumentManager";

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

describe('Index and Retrieve', () => {

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
    const recipeIds = Object.keys(rawRecipeData());
    const componentIds = Object.keys(rawComponentData());
    const itemData = new Map(
        componentIds
            .concat(recipeIds)
            .map(id => [id, <FabricateItemData>{
                name: stubItemName,
                imageUrl: stubItemImageUrl,
                uuid: id,
                source: stubItemSource
            }])
    );
    const stubDocumentManager = new StubDocumentManager(itemData);

    test.skip('Should delete invalid components when loading fails', async () => {

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

    test('Should load a populated Part Dictionary from source data', async () => {

        const essences = rawEssenceData();
        const underTest: PartDictionary = new PartDictionaryFactory({documentManager: stubDocumentManager})
            .make({
                essences: essences,
                recipes: rawRecipeData(),
                components: rawComponentData()
            });

        expect(underTest).not.toBeNull();
        expect(underTest.size).toBe(16);

        await underTest.loadAll();

        expect(underTest.size).toBe(16);

        Object.keys(essences).forEach(id => expect(underTest.hasEssence(id)).toEqual(true))

        const loadedComponents = await underTest.getComponents();
        loadedComponents.forEach(component => {
            expect(underTest.hasComponent(component.id)).toEqual(true);
            expect(component.name).toEqual(stubItemName);
            expect(component.imageUrl).toEqual(stubItemImageUrl);
            expect(componentIds).toEqual(expect.arrayContaining([component.id]));
        });

        const loadedRecipes = await underTest.getRecipes();
        loadedRecipes.forEach(recipe => {
            expect(underTest.hasRecipe(recipe.id)).toEqual(true);
            expect(recipe.name).toEqual(stubItemName);
            expect(recipe.imageUrl).toEqual(stubItemImageUrl);
            expect(recipeIds).toEqual(expect.arrayContaining([recipe.id]));
        })
    });

    test('Should delete and dereference components from recipes and salvage', async () => {

        const underTest: PartDictionary = new PartDictionaryFactory({documentManager: stubDocumentManager})
            .make({
                essences: rawEssenceData(),
                recipes: rawRecipeData(),
                components: rawComponentData()
            });

        expect(underTest).not.toBeNull();
        expect(underTest.size).toBe(16);

        await underTest.loadAll();

        const componentToDelete = testComponentThree;
        const componentIdToDelete = componentToDelete.id;

        await underTest.deleteComponentById(componentIdToDelete)

        expect(underTest.size).toBe(15);

        const recipes = await underTest.getRecipes();

        recipes.forEach(recipe => {
            expect(recipe.catalysts.has(componentToDelete)).toEqual(false);
            recipe.ingredientOptions.choices.forEach(choice => {
                expect(choice.value.has(componentToDelete)).toEqual(false);
            });
            recipe.resultOptions.choices.forEach(choice => {
                expect(choice.value.has(componentToDelete)).toEqual(false);
            });
        });

        const components = await underTest.getComponents();
        expect(new Map(components.map(component => [component.id, component])).has(componentIdToDelete)).toEqual(false);
        components.forEach(component => expect(component.salvage.has(componentToDelete.summarise())).toEqual(false));

        const asJson = underTest.toJson();
        expect(Object.keys(asJson.components).length).toEqual(4);
        expect(asJson.components[componentIdToDelete]).toBeUndefined();

    });

    test('Should delete and dereference essences from recipes and components', async () => {

        const underTest: PartDictionary = new PartDictionaryFactory({documentManager: stubDocumentManager})
            .make({
                essences: rawEssenceData(),
                recipes: rawRecipeData(),
                components: rawComponentData()
            });

        expect(underTest).not.toBeNull();
        expect(underTest.size).toBe(16);

        await underTest.loadAll();

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