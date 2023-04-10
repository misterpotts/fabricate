import {beforeEach, describe, expect, test} from "@jest/globals";
import {DefaultRecipeApi, RecipeData} from "../src/scripts/api/RecipeApi"
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
import {testCraftingSystem} from "./test_data/TestCrafingSystem";
import {
    Recipe,
    RequirementOption,
    RequirementOptionJson,
    ResultOption,
    ResultOptionJson
} from "../src/scripts/crafting/recipe/Recipe";
import {SelectableOptions} from "../src/scripts/crafting/recipe/SelectableOptions";
import {DefaultEntityValidationResult} from "../src/scripts/api/EntityValidator";

const identityFactory = new StubIdentityFactory();
const localizationService = new StubLocalizationService();
const notificationService = new StubNotificationService();
const craftingSystemApi = new StubCraftingSystemApi({
    valuesById: new Map([[testCraftingSystem.id, testCraftingSystem]])
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
const settingManager = new StubSettingManager<RecipeData>({
    recipesById: {
        [ testRecipeOne.id ]: testRecipeOne.toJson(),
        [ testRecipeTwo.id ]: testRecipeTwo.toJson(),
        [ testRecipeThree.id ]: testRecipeThree.toJson(),
        [ testRecipeFour.id ]: testRecipeFour.toJson(),
        [ testRecipeFive.id ]: testRecipeFive.toJson(),
        [ testRecipeSix.id ]: testRecipeSix.toJson(),
        [ testRecipeSeven.id ]: testRecipeSeven.toJson()
    },
    recipeIdsByItemUuid: {
        [ testRecipeOne.itemUuid ]: [ testRecipeOne.id ],
        [ testRecipeTwo.itemUuid ]: [ testRecipeTwo.id ],
        [ testRecipeThree.itemUuid ]: [ testRecipeThree.id ],
        [ testRecipeFour.itemUuid ]: [ testRecipeFour.id ],
        [ testRecipeFive.itemUuid ]: [ testRecipeFive.id ],
        [ testRecipeSix.itemUuid ]: [ testRecipeSix.id ],
        [ testRecipeSeven.itemUuid ]: [ testRecipeSeven.id ]
    },
    recipeIdsByCraftingSystemId: {
        [ testCraftingSystem.id ]:
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
});

beforeEach(() => {
    settingManager.reset();
    documentManager.reset();
});

describe("Create", () => {


    test("should create a new recipe for valid item UUID and crafting system ID", async () => {

        const craftingSystemId = testCraftingSystem.id
        const recipeId = "3456abcd";
        const itemUuid = "1234abcd";
        documentManager.setAllowUnknownIds(true);

        const underTest = new DefaultRecipeApi({
            essenceApi,
            componentApi,
            identityFactory: new StubIdentityFactory(recipeId),
            localizationService,
            notificationService,
            settingManager,
            documentManager,
            recipeValidator
        });

        const result = await underTest.create({ itemUuid, craftingSystemId });

        expect(result.id).toEqual(recipeId);
        expect(result.craftingSystemId).toEqual(craftingSystemId);
        expect(result.itemUuid).toEqual(itemUuid);

    });

    test("should not create a recipe when the crafting system does not exist", async () => {

        const underTest = new DefaultRecipeApi({
            essenceApi,
            componentApi,
            identityFactory,
            localizationService,
            notificationService,
            settingManager,
            documentManager,
            recipeValidator
        });

        const itemUuid = "1234abcd";
        documentManager.setAllowUnknownIds(true);
        const craftingSystemId = "2345abcd";
        await expect(() => underTest.create({itemUuid, craftingSystemId})).rejects;

    });

    test("should not create a recipe when the item does not exist", async () => {
        const craftingSystemId = testCraftingSystem.id;

        const underTest = new DefaultRecipeApi({
            essenceApi,
            componentApi,
            identityFactory,
            localizationService,
            notificationService,
            settingManager,
            documentManager,
            recipeValidator
        });

        const itemUuid = "1234abcd";
        await expect(() => underTest.create({itemUuid, craftingSystemId})).rejects;

    });

    test("should save a valid recipe when the crafting system and item document exist", async () => {

        const underTest = new DefaultRecipeApi({
            essenceApi,
            componentApi,
            identityFactory,
            localizationService,
            notificationService,
            settingManager,
            documentManager,
            recipeValidator
        });

        const result = await underTest.save(testRecipeOne);

        expect(result).not.toBeUndefined();

    });

    test("should not save a recipe when the crafting system doesn't exist", async () => {

        const underTest = new DefaultRecipeApi({
            essenceApi,
            componentApi,
            identityFactory,
            localizationService,
            notificationService,
            settingManager,
            documentManager,
            recipeValidator
        });

        const modified = new Recipe({
            id: identityFactory.make(),
            craftingSystemId: "notAValidCraftingSystemId",
            itemData: testRecipeOne.itemData,
            resultOptions: new SelectableOptions<ResultOptionJson, ResultOption>({
                options: testRecipeOne.resultOptions
            }),
            essences: testRecipeOne.essences,
            ingredientOptions: new SelectableOptions<RequirementOptionJson, RequirementOption>({
                options: testRecipeOne.ingredientOptions
            }),
            disabled: testRecipeOne.isDisabled
        });

        await expect(() => underTest.save(modified)).rejects;

    });

    test("should not save a recipe when the recipe is invalid", async () => {

        const underTest = new DefaultRecipeApi({
            essenceApi,
            componentApi,
            identityFactory,
            localizationService,
            notificationService,
            settingManager,
            documentManager,
            recipeValidator: {
                validate: async (recipe: Recipe) => new DefaultEntityValidationResult({
                    entity: recipe,
                    isSuccessful: false
                })
            }
        });

        await expect(() => underTest.save(testRecipeOne)).rejects;

    });

});

describe("Access", () => {

    test("Should return undefined for recipe that does not exist", async () => {

        await settingManager.write({
            recipesById: {},
            recipeIdsByItemUuid: {},
            recipeIdsByCraftingSystemId: {}
        });

        const underTest = new DefaultRecipeApi({
            essenceApi,
            componentApi,
            identityFactory,
            localizationService,
            notificationService,
            settingManager,
            documentManager,
            recipeValidator
        });

        const result = await underTest.getById(testRecipeOne.id);

        expect(result).toBeUndefined();

    });

    test("Should get a recipe by ID with pending item data ready to load", async () => {

        const underTest = new DefaultRecipeApi({
            essenceApi,
            componentApi,
            identityFactory,
            localizationService,
            notificationService,
            settingManager,
            documentManager,
            recipeValidator
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

        const underTest = new DefaultRecipeApi({
            essenceApi,
            componentApi,
            identityFactory,
            localizationService,
            notificationService,
            settingManager,
            documentManager,
            recipeValidator
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

});

describe("Edit", () => {



});

describe("Delete", () => {



});