import {beforeEach, describe, expect, test} from "@jest/globals";
import {DefaultRecipeAPI} from "../src/scripts/api/RecipeAPI"
import {StubCraftingSystemApi} from "./stubs/api/StubCraftingSystemApi";
import {StubEssenceApi} from "./stubs/api/StubEssenceApi";
import {StubComponentApi} from "./stubs/api/StubComponentApi";
import {StubLocalizationService} from "./stubs/foundry/StubLocalizationService";
import {StubNotificationService} from "./stubs/foundry/StubNotificationService";
import {StubDocumentManager} from "./stubs/StubDocumentManager";
import {StubIdentityFactory} from "./stubs/foundry/StubIdentityFactory";
import {DefaultRecipeValidator} from "../src/scripts/crafting/recipe/RecipeValidator";
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
import {EntityDataStore, SerialisedEntityData} from "../src/scripts/repository/EntityDataStore";
import {RecipeCollectionManager} from "../src/scripts/repository/CollectionManager";
import {StubEntityFactory} from "./stubs/StubEntityFactory";
import {
    LoadedFabricateItemData,
    PendingFabricateItemData
} from "../src/scripts/foundry/DocumentManager";
import Properties from "../src/scripts/Properties";
import {StubRecipeValidator} from "./stubs/StubRecipeValidator";

const identityFactory = new StubIdentityFactory();
const localizationService = new StubLocalizationService();
const notificationService = new StubNotificationService();
const craftingSystemAPI = new StubCraftingSystemApi({
    valuesById: new Map([[testCraftingSystemOne.id, testCraftingSystemOne]])
});
const componentAPI = new StubComponentApi({
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
const essenceAPI = new StubEssenceApi({
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
const recipeValidator = new DefaultRecipeValidator({
    craftingSystemAPI,
    componentAPI,
    essenceAPI
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

beforeEach(() => {
    documentManager.reset();
    resetAllTestRecipes();
});

describe("Create", () => {


    test("should create a new recipe for valid item UUID and crafting system ID", async () => {

        const itemUuid = "12345abcd";
        const craftingSystemId = testCraftingSystemOne.id;
        const loadedFabricateItemData = new LoadedFabricateItemData({
            itemUuid,
            sourceDocument: {},
            errors: [],
            imageUrl: "path/to/image",
            name: "Test Item",
        });
        const createdRecipe = new Recipe({
            id: "3456abcd",
            itemData: new PendingFabricateItemData(itemUuid, () => Promise.resolve(loadedFabricateItemData)),
            craftingSystemId: craftingSystemId
        });
        documentManager.setAllowUnknownIds(true);

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>(defaultSettingValue()),
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({
                valuesById: new Map([
                    [ "3456abcd", createdRecipe ],
                    [ testRecipeOne.id, testRecipeOne ],
                    [ testRecipeTwo.id, testRecipeTwo ],
                    [ testRecipeThree.id, testRecipeThree ],
                    [ testRecipeFour.id, testRecipeFour ],
                    [ testRecipeFive.id, testRecipeFive ],
                    [ testRecipeSix.id, testRecipeSix ],
                    [ testRecipeSeven.id, testRecipeSeven ]
                ])
            }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeStore: recipeDataStore,
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
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>(defaultSettingValue()),
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeStore: recipeDataStore,
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
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>(defaultSettingValue()),
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeStore: recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const itemUuid = "1234abcd";

        expect.assertions(1);
        await expect(underTest.create({itemUuid, craftingSystemId})).rejects.toThrow();

    });

    test("should save a valid recipe when the crafting system and item document exist", async () => {

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>(defaultSettingValue()),
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeStore: recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const result = await underTest.save(testRecipeOne);

        expect(result).not.toBeUndefined();

    });

    test("should not save a recipe when the crafting system doesn't exist", async () => {

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>(defaultSettingValue()),
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeStore: recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const modified = new Recipe({
            id: identityFactory.make(),
            craftingSystemId: "notAValidCraftingSystemId",
            itemData: testRecipeOne.itemData,
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
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>(defaultSettingValue()),
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator: new StubRecipeValidator(false),
            recipeStore: recipeDataStore,
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
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>(defaultSettingValue()),
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeStore: recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const result = await underTest.getById("notAValidId");

        expect(result).toBeUndefined();

    });

    test("Should get a recipe by ID with pending item data ready to load", async () => {

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>(defaultSettingValue()),
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeStore: recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const result = await underTest.getById(testRecipeOne.id);

        expect(result).not.toBeUndefined();
        expect(result.loaded).toEqual(false);
        expect(result.itemUuid).toEqual(testRecipeOne.itemUuid);
        expect(() => result.name).toThrow();
        expect(() => result.imageUrl).toThrow();
        expect(() => result.itemData.sourceDocument).toThrow();

        await result.load();

        expect(result.loaded).toEqual(true);
        expect(result.itemUuid).toEqual(testRecipeOne.itemUuid);
        expect(result.name).toEqual(testRecipeOne.name);
        expect(result.imageUrl).toEqual(testRecipeOne.imageUrl);
        expect(result.itemData.sourceDocument).toEqual(testRecipeOne.itemData.sourceDocument);

    });

    test("Should get many recipes by ID with pending item data ready to load and undefined for missing values", async () => {

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>(defaultSettingValue()),
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeStore: recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const result = await underTest.getAllById([ testRecipeOne.id, testRecipeTwo.id, testRecipeThree.id, "notAValidId" ]);

        expect(result).not.toBeUndefined();
        expect(result.size).toEqual(4);
        const recipes = Array.from(result.values()).filter(recipe => typeof recipe !== 'undefined');
        expect(recipes.length).toEqual(3);
        expect(recipes.filter(recipe => recipe.loaded).length).toEqual(0);

        const loaded = await Promise.all(recipes.map(async recipe => {
            await recipe.load();
            return recipe;
        }));

        expect(loaded.filter(recipe => recipe.loaded).length).toEqual(3);

    });

    test("Should get all recipes without loading", async () => {

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>(defaultSettingValue()),
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeStore: recipeDataStore,
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
        expect(Array.from(result.values()).filter(recipe => recipe.loaded).length).toEqual(0);

    });

    test("Should get all recipes by crafting system ID without loading", async () => {

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>(defaultSettingValue()),
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeStore: recipeDataStore,
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
        expect(Array.from(result.values()).filter(recipe => recipe.loaded).length).toEqual(0);

    });

    test("Should get all recipes by item UUID without loading", async () => {

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>(defaultSettingValue()),
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeStore: recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const result = await underTest.getAllByItemUuid(testRecipeOne.itemUuid);

        expect(result).not.toBeUndefined();
        expect(result.size).toEqual(1);
        expect(result.has(testRecipeOne.id)).toEqual(true);
        expect(result.get(testRecipeOne.id).loaded).toEqual(false);

    });

});

describe("Edit", () => {

    test("should clone a recipe by ID", async () => {

        const factoryFunction = async (recipeJson: RecipeJson) => {
            return Recipe.fromJson(recipeJson);
        };
        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>(defaultSettingValue()),
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes, factoryFunction }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeStore: recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const result = await underTest.cloneById(testRecipeOne.id);

        expect(result).not.toBeNull();
        expect(result.id.length).toBeGreaterThan(1);
        expect(result.id).not.toEqual(testRecipeOne.id);
        expect(result.requirementOptions.equals(testRecipeOne.requirementOptions)).toBe(true);
        expect(result.resultOptions.equals(testRecipeOne.resultOptions)).toBe(true);

    });

    test("should modify a recipe", async () => {

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>(defaultSettingValue()),
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeStore: recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const recipeToEdit = await underTest.getById(testRecipeOne.id);

        const essencesBefore = {
            size: recipeToEdit.requirementOptions.all.map(option => option.essences.size).reduce((left, right) => left + right, 0),
            fireCount: recipeToEdit.requirementOptions.all.map(option => option.essences.amountFor(elementalFire.id)).reduce((left, right) => left + right, 0)
        };
        const requirementOptionCount = recipeToEdit.requirementOptions.size;
        recipeToEdit.requirementOptions.all.forEach(option => {
            option.essences = option.essences.increment(elementalFire.toReference());
        });

        await underTest.save(recipeToEdit);

        const editedRecipe = await underTest.getById(testRecipeOne.id);
        const essencesAfter = {
            size: editedRecipe.requirementOptions.all.map(option => option.essences.size).reduce((left, right) => left + right, 0),
            fireCount: editedRecipe.requirementOptions.all.map(option => option.essences.amountFor(elementalFire.id)).reduce((left, right) => left + right, 0)
        };

        expect(essencesAfter.size).toEqual(essencesBefore.size + requirementOptionCount);
        expect(essencesAfter.fireCount).toEqual(essencesBefore.fireCount + requirementOptionCount);

    });

});

describe("Delete", () => {

    test("should delete a recipe by ID", async () => {

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>(defaultSettingValue()),
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeStore: recipeDataStore,
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
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>(defaultSettingValue()),
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator: new DefaultRecipeValidator({
                craftingSystemAPI: emptyCraftingSystemApi,
                componentAPI: componentAPI,
                essenceAPI: essenceAPI
            }),
            recipeStore: recipeDataStore,
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
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>(defaultSettingValue()),
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeStore: recipeDataStore,
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
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>(defaultSettingValue()),
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator: new DefaultRecipeValidator({
                craftingSystemAPI: emptyCraftingSystemApi,
                componentAPI: componentAPI,
                essenceAPI: essenceAPI
            }),
            recipeStore: recipeDataStore,
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
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>(defaultSettingValue()),
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeStore: recipeDataStore,
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
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>(defaultSettingValue()),
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeStore: recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const componentIdToDelete = testComponentThree.id;
        const craftingSystemId = testCraftingSystemOne.id;
        const allBefore = await underTest.getAllByCraftingSystemId(craftingSystemId);
        const countBefore = countComponentReferences(Array.from(allBefore.values()), componentIdToDelete);
        expect(countBefore.matchingRecipes.length).toBeGreaterThan(0);
        expect(countBefore.amount).toBeGreaterThan(0);

        const modified = await underTest.removeComponentReferences(componentIdToDelete, craftingSystemId);
        expect(modified.length).toEqual(countBefore.matchingRecipes.length);
        modified.forEach(recipe => expect(countBefore.matchingRecipes.includes(recipe.id)).toEqual(true));

        const allAfter = await underTest.getAllByCraftingSystemId(craftingSystemId);
        expect(allAfter.size).toEqual(allBefore.size);
        const countAfter = countComponentReferences(Array.from(allAfter.values()), componentIdToDelete);
        expect(countAfter.matchingRecipes.length).toEqual(0);
        expect(countAfter.amount).toEqual(0);

    });

    test("should remove all essence references from all recipes", async () => {

        const recipeDataStore = new EntityDataStore({
            entityName: "recipe",
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>(defaultSettingValue()),
            entityFactory: new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes }),
            collectionManager: new RecipeCollectionManager()
        });

        const underTest = new DefaultRecipeAPI({
            notificationService,
            localizationService,
            recipeValidator,
            recipeStore: recipeDataStore,
            identityFactory: new StubIdentityFactory()
        });

        const essenceIdToDelete = elementalFire.id;
        const craftingSystemId = testCraftingSystemOne.id;
        const allBefore = await underTest.getAllByCraftingSystemId(craftingSystemId);
        const countBefore = countEssenceReferences(Array.from(allBefore.values()), essenceIdToDelete);
        expect(countBefore.matchingRecipes.length).toBeGreaterThan(0);
        expect(countBefore.amount).toBeGreaterThan(0);

        const modified = await underTest.removeEssenceReferences(essenceIdToDelete, craftingSystemId);
        expect(modified.length).toEqual(countBefore.matchingRecipes.length);
        modified.forEach(recipe => expect(countBefore.matchingRecipes.includes(recipe.id)).toEqual(true));

        const allAfter = await underTest.getAllByCraftingSystemId(craftingSystemId);
        const countAfter = countEssenceReferences(Array.from(allAfter.values()), essenceIdToDelete);
        expect(countAfter.matchingRecipes.length).toEqual(0);
        expect(countAfter.amount).toEqual(0);

    });

});

function countComponentReferences(recipes: Recipe[], componentId: string) {
    return recipes
        .map(recipe => {
            const amountInIngredients = recipe.requirementOptions
                .all
                .map(requirementOption => requirementOption.ingredients.amountFor(componentId))
                .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
            const amountInCatalysts = recipe.requirementOptions
                .all
                .map(requirementOption => requirementOption.catalysts.amountFor(componentId))
                .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
            const amountInResults = recipe.resultOptions
                .all
                .map(resultOption => resultOption.results.amountFor(componentId))
                .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
            const amount = amountInIngredients + amountInCatalysts + amountInResults;
            return {
                amount,
                matchingRecipes: amount > 0 ? [recipe.id] : []
            };
        })
        .reduce((previousValue, currentValue) => {
            return {
                amount: previousValue.amount + currentValue.amount,
                matchingRecipes: previousValue.matchingRecipes.concat(currentValue.matchingRecipes)
            }
        }, { amount: 0, matchingRecipes: [] });
}

function countEssenceReferences(recipes: Recipe[], essenceId: string): { amount: number, matchingRecipes: string[] } {
    return recipes
        .flatMap(recipe => {
            return recipe.requirementOptions.all.map(requirementOption => {
                return {
                    requirementOption,
                    recipeId: recipe.id
                }
            });
        })
        .filter(candidate => candidate.requirementOption.essences.has(essenceId))
        .reduce((summary, recipeRequirementOption) => {
            return {
                amount: summary.amount + recipeRequirementOption.requirementOption.essences.amountFor(essenceId),
                matchingRecipes: summary.matchingRecipes.includes(recipeRequirementOption.recipeId) ? summary.matchingRecipes : summary.matchingRecipes.concat(recipeRequirementOption.recipeId)
            }
        }, { amount: 0, matchingRecipes: <string[]>[] });
}