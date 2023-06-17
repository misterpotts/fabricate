import {beforeEach, describe, expect, test} from "@jest/globals";
import {DefaultRecipeAPI} from "../src/scripts/api/RecipeAPI"
import {StubCraftingSystemApi} from "./stubs/api/StubCraftingSystemApi";
import {StubEssenceApi} from "./stubs/api/StubEssenceApi";
import {StubComponentApi} from "./stubs/api/StubComponentApi";
import {StubLocalizationService} from "./stubs/foundry/StubLocalizationService";
import {StubNotificationService} from "./stubs/foundry/StubNotificationService";
import {StubDocumentManager} from "./stubs/StubDocumentManager";
import {StubIdentityFactory} from "./stubs/foundry/StubIdentityFactory";
import {RecipeValidator} from "../src/scripts/crafting/recipe/RecipeValidator";
import {StubSettingManager} from "./stubs/foundry/StubSettingManager";
import {
    allTestRecipes,
    resetAllTestRecipes,
    testRecipeFive,
    testRecipeFour,
    testRecipeOne,
    testRecipeSeven,
    testRecipeSix,
    testRecipeThree,
    testRecipeTwo
} from "./test_data/TestRecipes";
import {
    testComponentFive,
    testComponentFour,
    testComponentOne,
    testComponentSeven,
    testComponentSix,
    testComponentThree,
    testComponentTwo
} from "./test_data/TestCraftingComponents";
import {elementalAir, elementalEarth, elementalFire, elementalWater} from "./test_data/TestEssences";
import {testCraftingSystemOne} from "./test_data/TestCrafingSystem";
import {Recipe, RecipeJson} from "../src/scripts/crafting/recipe/Recipe";
import {DefaultEntityValidationResult} from "../src/scripts/api/EntityValidator";
import {EntityDataStore, SerialisedEntityData} from "../src/scripts/api/EntityDataStore";
import {RecipeCollectionManager} from "../src/scripts/api/CollectionManager";
import {StubEntityFactory} from "./stubs/StubEntityFactory";
import {
    BrokenFabricateItemData,
    PendingFabricateItemData
} from "../src/scripts/foundry/DocumentManager";
import Properties from "../src/scripts/Properties";

const identityFactory = new StubIdentityFactory();
const localizationService = new StubLocalizationService();
const notificationService = new StubNotificationService();
const craftingSystemApi = new StubCraftingSystemApi({
    valuesById: new Map([[testCraftingSystemOne.id, testCraftingSystemOne]])
});
const componentApi = new StubComponentApi({
    valuesById: new Map([
        [testComponentOne.id, testComponentOne],
        [testComponentTwo.id, testComponentTwo],
        [testComponentThree.id, testComponentThree],
        [testComponentFour.id, testComponentFour],
        [testComponentFive.id, testComponentFive],
        [testComponentSix.id, testComponentSix],
        [testComponentSeven.id, testComponentSeven]
    ])
});
const essenceApi = new StubEssenceApi({
    valuesById: new Map([
        [elementalEarth.id, elementalEarth],
        [elementalFire.id, elementalFire],
        [elementalWater.id, elementalWater],
        [elementalAir.id, elementalAir],
    ])
});
const documentManager = new StubDocumentManager({
    itemDataByUuid: new Map([
        [testComponentOne.itemUuid, testComponentOne.itemData],
        [testComponentTwo.itemUuid, testComponentTwo.itemData],
        [testComponentThree.itemUuid, testComponentThree.itemData],
        [testComponentFour.itemUuid, testComponentFour.itemData],
        [testComponentFive.itemUuid, testComponentFive.itemData],
        [testComponentSix.itemUuid, testComponentSix.itemData],
        [testComponentSeven.itemUuid, testComponentSeven.itemData],
        [testRecipeOne.itemUuid, testRecipeOne.itemData],
        [testRecipeTwo.itemUuid, testRecipeTwo.itemData],
        [testRecipeThree.itemUuid, testRecipeThree.itemData],
        [testRecipeFour.itemUuid, testRecipeFour.itemData],
        [testRecipeFive.itemUuid, testRecipeFive.itemData],
        [testRecipeSix.itemUuid, testRecipeSix.itemData],
        [testRecipeSeven.itemUuid, testRecipeSeven.itemData]
    ])
});
const recipeValidator = new RecipeValidator({
    craftingSystemApi,
    componentApi,
    essenceApi
});
const defaultSettingValue = () => {
   return {
        entities: {
            [ testRecipeOne.id ]: testRecipeOne.toJson(),
            [ testRecipeTwo.id ]: testRecipeTwo.toJson(),
            [ testRecipeThree.id ]: testRecipeThree.toJson(),
            [ testRecipeFour.id ]: testRecipeFour.toJson(),
            [ testRecipeFive.id ]: testRecipeFive.toJson(),
            [ testRecipeSix.id ]: testRecipeSix.toJson(),
            [ testRecipeSeven.id ]: testRecipeSeven.toJson()
        },
       collections: {
            [ `${Properties.settings.collectionNames.item}.${testRecipeOne.itemUuid}` ]: [ testRecipeOne.id ],
            [ `${Properties.settings.collectionNames.item}.${testRecipeTwo.itemUuid}` ]: [ testRecipeOne.id ],
            [ `${Properties.settings.collectionNames.item}.${testRecipeThree.itemUuid}` ]: [ testRecipeOne.id ],
            [ `${Properties.settings.collectionNames.item}.${testRecipeFour.itemUuid}` ]: [ testRecipeOne.id ],
            [ `${Properties.settings.collectionNames.item}.${testRecipeFive.itemUuid}` ]: [ testRecipeOne.id ],
            [ `${Properties.settings.collectionNames.item}.${testRecipeSix.itemUuid}` ]: [ testRecipeOne.id ],
            [ `${Properties.settings.collectionNames.item}.${testRecipeSeven.itemUuid}` ]: [ testRecipeOne.id ],
            [ `${Properties.settings.collectionNames.craftingSystem}.${testCraftingSystemOne.id}` ]:
                [
                    testRecipeOne.id,
                    testRecipeTwo.id,
                    testRecipeThree.id,
                    testRecipeFour.id,
                    testRecipeFive.id,
                    testRecipeSix.id,
                    testRecipeSeven.id
                ]
       }
    };
};
const settingManager = new StubSettingManager<SerialisedEntityData<RecipeJson>>(defaultSettingValue());

beforeEach(() => {
    settingManager.reset(defaultSettingValue());
    documentManager.reset();
    resetAllTestRecipes();
});

describe("Create", () => {


    test("should create a new recipe for valid item UUID and crafting system ID", async () => {

        const itemUuid = "1234abcd";
        const craftingSystemId = testCraftingSystemOne.id;
        const createdRecipe = new Recipe({
            id: "3456abcd",
            itemData: new PendingFabricateItemData(itemUuid, () => Promise.resolve(new BrokenFabricateItemData({itemUuid, errors: [] }))),
            craftingSystemId: craftingSystemId
        });
        documentManager.setAllowUnknownIds(true);

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager,
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: new Map([[ "3456abcd", createdRecipe ]]) }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeDataStore,
            identityFactory: new StubIdentityFactory("3456abcd")
        });

        const result = await underTest.create({ itemUuid, craftingSystemId });

        expect(result.id).toEqual("3456abcd");
        expect(result.craftingSystemId).toEqual(craftingSystemId);
        expect(result.itemUuid).toEqual(itemUuid);

    });

    test("should not create a recipe when the crafting system does not exist", async () => {

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager,
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const itemUuid = "1234abcd";
        documentManager.setAllowUnknownIds(true);
        const craftingSystemId = "2345abcd";

        expect.assertions(1);
        await expect(underTest.create({itemUuid, craftingSystemId})).rejects.toThrow();

    });

    test("should not create a recipe when the item does not exist", async () => {
        const craftingSystemId = testCraftingSystemOne.id;

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager,
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const itemUuid = "1234abcd";

        expect.assertions(1);
        await expect(underTest.create({itemUuid, craftingSystemId})).rejects.toThrow();

    });

    test("should save a valid recipe when the crafting system and item document exist", async () => {

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager,
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const result = await underTest.save(testRecipeOne);

        expect(result).not.toBeUndefined();

    });

    test("should not save a recipe when the crafting system doesn't exist", async () => {

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager,
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const modified = new Recipe({
            id: identityFactory.make(),
            craftingSystemId: "notAValidCraftingSystemId",
            itemData: testRecipeOne.itemData,
            essences: testRecipeOne.essences,
            resultOptions: testRecipeOne.resultOptions.clone(),
            requirementOptions: testRecipeOne.requirementOptions.clone(),
            disabled: testRecipeOne.isDisabled
        });

        expect.assertions(1);
        await expect(underTest.save(modified)).rejects.toThrow();

    });

    test("should not save a recipe when the recipe is invalid", async () => {

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager,
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator: {
                validate: async (recipe: Recipe) => new DefaultEntityValidationResult({
                    entity: recipe,
                    isSuccessful: false,
                    errors: ["Test Error"]
                })
            },
            recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        expect.assertions(1);
        await expect(underTest.save(testRecipeOne)).rejects.toThrow();

    });

});

describe("Access", () => {

    test("Should return undefined for recipe that does not exist", async () => {

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager,
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const result = await underTest.getById("notAValidId");

        expect(result).toBeUndefined();

    });

    test("Should get a recipe by ID with pending item data ready to load", async () => {

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager,
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const result = await underTest.getById(testRecipeOne.id);

        expect(result).not.toBeUndefined();
        expect(result.isLoaded).toEqual(false);
        expect(result.itemUuid).toEqual(testRecipeOne.itemUuid);
        expect(() => result.name).toThrow();
        expect(() => result.imageUrl).toThrow();
        expect(() => result.itemData.sourceDocument).toThrow();

        await result.load();

        expect(result.isLoaded).toEqual(true);
        expect(result.itemUuid).toEqual(testRecipeOne.itemUuid);
        expect(result.name).toEqual(testRecipeOne.name);
        expect(result.imageUrl).toEqual(testRecipeOne.imageUrl);
        expect(result.itemData.sourceDocument).toEqual(testRecipeOne.itemData.sourceDocument);

    });

    test("Should get many recipes by ID with pending item data ready to load and undefined for missing values", async () => {

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager,
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const result = await underTest.getAllById([ testRecipeOne.id, testRecipeTwo.id, testRecipeThree.id, "notAValidId" ]);

        expect(result).not.toBeUndefined();
        expect(result.size).toEqual(4);
        const recipes = Array.from(result.values()).filter(recipe => typeof recipe !== 'undefined');
        expect(recipes.length).toEqual(3);
        expect(recipes.filter(recipe => recipe.isLoaded).length).toEqual(0);

        const loaded = await Promise.all(recipes.map(async recipe => {
            await recipe.load();
            return recipe;
        }));

        expect(loaded.filter(recipe => recipe.isLoaded).length).toEqual(3);

    });

    test("Should get all recipes without loading", async () => {

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager,
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const result = await underTest.getAll();

        expect(result).not.toBeUndefined();
        expect(result.size).toEqual(7);
        expect(result.has(testRecipeOne.id)).toEqual(true);
        expect(result.has(testRecipeTwo.id)).toEqual(true);
        expect(result.has(testRecipeThree.id)).toEqual(true);
        expect(result.has(testRecipeFour.id)).toEqual(true);
        expect(result.has(testRecipeFive.id)).toEqual(true);
        expect(result.has(testRecipeSix.id)).toEqual(true);
        expect(result.has(testRecipeSeven.id)).toEqual(true);
        expect(Array.from(result.values()).filter(recipe => recipe.isLoaded).length).toEqual(0);

    });

    test("Should get all recipes by crafting system ID without loading", async () => {

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager,
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const result = await underTest.getAllByCraftingSystemId(testCraftingSystemOne.id);

        expect(result).not.toBeUndefined();
        expect(result.size).toEqual(7);
        expect(result.has(testRecipeOne.id)).toEqual(true);
        expect(result.has(testRecipeTwo.id)).toEqual(true);
        expect(result.has(testRecipeThree.id)).toEqual(true);
        expect(result.has(testRecipeFour.id)).toEqual(true);
        expect(result.has(testRecipeFive.id)).toEqual(true);
        expect(result.has(testRecipeSix.id)).toEqual(true);
        expect(result.has(testRecipeSeven.id)).toEqual(true);
        expect(Array.from(result.values()).filter(recipe => recipe.isLoaded).length).toEqual(0);

    });

    test("Should get all recipes by item UUID without loading", async () => {

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager,
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const result = await underTest.getAllByItemUuid(testRecipeOne.itemUuid);

        expect(result).not.toBeUndefined();
        expect(result.size).toEqual(1);
        expect(result.has(testRecipeOne.id)).toEqual(true);
        expect(result.get(testRecipeOne.id).isLoaded).toEqual(false);

    });

});

describe("Edit", () => {

    test("should clone a recipe by ID", async () => {

        let clonedRecipeJson: RecipeJson;
        const factoryFunction = (recipeJson: RecipeJson) => {
            clonedRecipeJson = recipeJson;
            return Promise.resolve(
                new Recipe({
                    id: recipeJson.id,
                    craftingSystemId: recipeJson.craftingSystemId
                })
            );
        };
        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager,
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes, factoryFunction }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const result = await underTest.cloneById(testRecipeOne.id);

        expect(result).not.toBeNull();
        expect(result.id.length).toBeGreaterThan(1);
        expect(result.id).not.toEqual(testRecipeOne.id);
        expect(clonedRecipeJson.requirementOptions.length).toEqual(testRecipeOne.requirementOptions.size);
        expect(clonedRecipeJson.resultOptions.length).toEqual(testRecipeOne.resultOptions.size);
        expect(Object.keys(clonedRecipeJson.essences).length).toEqual(testRecipeOne.essences.size);

    });

    test("should modify a recipe", async () => {

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager,
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const recipeToEdit = await underTest.getById(testRecipeOne.id);

        const essencesBefore = {
            size: recipeToEdit.essences.size,
            fireCount: recipeToEdit.essences.amountFor(elementalFire.id)
        };
        recipeToEdit.essences = recipeToEdit.essences.increment(elementalFire);

        await underTest.save(recipeToEdit);

        const editedRecipe = await underTest.getById(testRecipeOne.id);

        expect(editedRecipe.essences.size).toEqual(essencesBefore.size + 1);
        expect(editedRecipe.essences.amountFor(elementalFire)).toEqual(essencesBefore.fireCount + 1);

    });

});

describe("Delete", () => {

    test("should delete a recipe by ID", async () => {

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager,
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const before = await underTest.getById(testRecipeOne.id);
        const allBefore = await underTest.getAll();

        await underTest.deleteById(testRecipeOne.id);

        const after = await underTest.getById(testRecipeOne.id);
        const allAfter = await underTest.getAll();

        expect(before).not.toBeUndefined();
        expect(allBefore.size).toEqual(7);
        expect(after).toBeUndefined();
        expect(allAfter.size).toEqual(6);

    });

    test("should delete a recipe by ID even if the crafting system does not exist", async () => {

        const emptyCraftingSystemApi = new StubCraftingSystemApi();
        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager,
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator: new RecipeValidator({
                craftingSystemApi: emptyCraftingSystemApi,
                componentApi,
                essenceApi
            }),
            recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const before = await underTest.getById(testRecipeOne.id);
        const allBefore = await underTest.getAll();

        await underTest.deleteById(testRecipeOne.id);

        const after = await underTest.getById(testRecipeOne.id);
        const allAfter = await underTest.getAll();

        expect(before).not.toBeUndefined();
        expect(allBefore.size).toEqual(7);
        expect(after).toBeUndefined();
        expect(allAfter.size).toEqual(6);

    });

    test("should delete recipes by crafting system ID", async () => {

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager,
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const before = await underTest.getById(testRecipeOne.id);
        const allBefore = await underTest.getAll();

        await underTest.deleteByCraftingSystemId(testCraftingSystemOne.id);

        const after = await underTest.getById(testRecipeOne.id);
        const allAfter = await underTest.getAll();

        expect(before).not.toBeUndefined();
        expect(allBefore.size).toEqual(7);
        expect(after).toBeUndefined();
        expect(allAfter.size).toEqual(0);

    });

    test("should delete recipes by crafting system ID even if the crafting system does not exist", async () => {

        const emptyCraftingSystemApi = new StubCraftingSystemApi();

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager,
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator: new RecipeValidator({
                craftingSystemApi: emptyCraftingSystemApi,
                componentApi,
                essenceApi
            }),
            recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const before = await underTest.getById(testRecipeOne.id);
        const allBefore = await underTest.getAll();

        await underTest.deleteByCraftingSystemId(testCraftingSystemOne.id);

        const after = await underTest.getById(testRecipeOne.id);
        const allAfter = await underTest.getAll();

        expect(before).not.toBeUndefined();
        expect(allBefore.size).toEqual(7);
        expect(after).toBeUndefined();
        expect(allAfter.size).toEqual(0);

    });

    test("should delete recipes by item UUID", async () => {

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager,
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const before = await underTest.getById(testRecipeOne.id);
        const allBefore = await underTest.getAll();

        await underTest.deleteByItemUuid(testRecipeOne.itemUuid);

        const after = await underTest.getById(testRecipeOne.id);
        const allAfter = await underTest.getAll();

        expect(before).not.toBeUndefined();
        expect(allBefore.size).toEqual(7);
        expect(after).toBeUndefined();
        expect(allAfter.size).toEqual(6);

    });

    test("should remove all component references from all recipes", async () => {

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager,
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const componentIdToDelete = testComponentThree.id;
        const craftingSystemId = testCraftingSystemOne.id;
        const allBefore = await underTest.getAllByCraftingSystemId(craftingSystemId);
        const countBefore = countComponentReferences(Array.from(allBefore.values()), componentIdToDelete);
        expect(countBefore.matches.length).toBeGreaterThan(0);
        expect(countBefore.amount).toBeGreaterThan(0);

        const modified = await underTest.removeComponentReferences(componentIdToDelete, craftingSystemId);
        expect(modified.length).toEqual(countBefore.matches.length);
        modified.forEach(recipe => expect(countBefore.matches.includes(recipe.id)).toEqual(true));

        const allAfter = await underTest.getAllByCraftingSystemId(craftingSystemId);
        expect(allAfter.size).toEqual(allBefore.size);
        const countAfter = countComponentReferences(Array.from(allAfter.values()), componentIdToDelete);
        expect(countAfter.matches.length).toEqual(0);
        expect(countAfter.amount).toEqual(0);

    });

    test("should remove all essence references from all recipes", async () => {

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager,
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const essenceIdToDelete = elementalFire.id;
        const craftingSystemId = testCraftingSystemOne.id;
        const allBefore = await underTest.getAllByCraftingSystemId(craftingSystemId);
        const countBefore = countEssenceReferences(Array.from(allBefore.values()), essenceIdToDelete);
        expect(countBefore.matches.length).toBeGreaterThan(0);
        expect(countBefore.amount).toBeGreaterThan(0);

        const modified = await underTest.removeEssenceReferences(essenceIdToDelete, craftingSystemId);
        expect(modified.length).toEqual(countBefore.matches.length);
        modified.forEach(recipe => expect(countBefore.matches.includes(recipe.id)).toEqual(true));

        const allAfter = await underTest.getAllByCraftingSystemId(craftingSystemId);
        const countAfter = countEssenceReferences(Array.from(allAfter.values()), essenceIdToDelete);
        expect(countAfter.matches.length).toEqual(0);
        expect(countAfter.amount).toEqual(0);

    });

});

function countComponentReferences(recipes: Recipe[], componentId: string) {
    return recipes
        .map(recipe => {
            const amountInIngredients = recipe.requirementOptions
                .options
                .map(requirementOption => requirementOption.ingredients.amountFor(componentId))
                .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
            const amountInCatalysts = recipe.requirementOptions
                .options
                .map(requirementOption => requirementOption.catalysts.amountFor(componentId))
                .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
            const amountInResults = recipe.resultOptions
                .options
                .map(resultOption => resultOption.results.amountFor(componentId))
                .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
            const amount = amountInIngredients + amountInCatalysts + amountInResults;
            return {
                amount,
                matches: amount > 0 ? [recipe.id] : []
            };
        })
        .reduce((previousValue, currentValue) => {
            return {
                amount: previousValue.amount + currentValue.amount,
                matches: previousValue.matches.concat(currentValue.matches)
            }
        }, { amount: 0, matches: [] });
}

function countEssenceReferences(recipes: Recipe[], essenceId: string) {
    return recipes
        .map(recipe => {
            const amount = recipe.essences.amountFor(essenceId);
            return {
                amount,
                matches: amount > 0 ? [recipe.id] : []
            };
        })
        .reduce((previousValue, currentValue) => {
            return {
                amount: previousValue.amount + currentValue.amount,
                matches: previousValue.matches.concat(currentValue.matches)
            }
        }, { amount: 0, matches: [] });
}