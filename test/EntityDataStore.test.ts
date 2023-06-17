import { describe, test, expect } from "@jest/globals";
import {EntityDataStore, SerialisedEntityData} from "../src/scripts/api/EntityDataStore";
import {allTestRecipes, testRecipeFour, testRecipeOne, testRecipeThree, testRecipeTwo} from "./test_data/TestRecipes";
import {testCraftingSystemOne} from "./test_data/TestCrafingSystem";
import {Recipe, RecipeJson} from "../src/scripts/crafting/recipe/Recipe";
import {RecipeCollectionManager} from "../src/scripts/api/CollectionManager";
import {StubSettingManager} from "./stubs/foundry/StubSettingManager";
import Properties from "../src/scripts/Properties";
import {StubEntityFactory} from "./stubs/StubEntityFactory";

const recipeFactory = new StubEntityFactory<RecipeJson, Recipe>({ valuesById: allTestRecipes });

describe('Reading', () => {

    test("should fail to read from invalid setting data without entities or collections", async () => {

        const underTest = new EntityDataStore({
            entityName: "Recipe",
            entityFactory: recipeFactory,
            collectionManager: new RecipeCollectionManager(),
            // @ts-ignore
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>({})
        });

        await expect(underTest.getById("anyId")).rejects
            .toThrow("The settings value at \"stub.setting.path\" for the Recipe data store is missing both of the required \"entities\" and \"collections\" properties");
        await expect(underTest.getCollection("anyCollection", "anyPrefix")).rejects
            .toThrow("The settings value at \"stub.setting.path\" for the Recipe data store is missing both of the required \"entities\" and \"collections\" properties");

    });

    test("should fail to read from invalid setting data without entities", async () => {

        const underTest = new EntityDataStore({
            entityName: "Recipe",
            entityFactory: recipeFactory,
            collectionManager: new RecipeCollectionManager(),
            // @ts-ignore
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>({ collections: {} })
        });

        await expect(underTest.getById("anyId")).rejects
            .toThrow("The settings value at \"stub.setting.path\" for the Recipe data store is missing the required \"entities\" property");
        await expect(underTest.getCollection("anyCollection", "anyPrefix")).rejects
            .toThrow("The settings value at \"stub.setting.path\" for the Recipe data store is missing the required \"entities\" property");

    });

    test("should fail to read from invalid setting data without collections", async () => {

        const underTest = new EntityDataStore({
            entityName: "Recipe",
            entityFactory: recipeFactory,
            collectionManager: new RecipeCollectionManager(),
            // @ts-ignore
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>({ entities: {} })
        });

        await expect(underTest.getById("anyId")).rejects
            .toThrow("The settings value at \"stub.setting.path\" for the Recipe data store is missing the required \"collections\" property");
        await expect(underTest.getCollection("anyCollection", "anyPrefix")).rejects
            .toThrow("The settings value at \"stub.setting.path\" for the Recipe data store is missing the required \"collections\" property");

    });


    test("should fail to get entities when the entity factory returns undefined", async () => {

        // Prepare the serialized data
        const serializedData: SerialisedEntityData<RecipeJson> = {
            entities: {
                [testRecipeOne.id]: testRecipeOne.toJson(),
                [testRecipeTwo.id]: testRecipeTwo.toJson()
            },
            collections: {
                [ `${Properties.settings.collectionNames.craftingSystem}.${testCraftingSystemOne.id}` ]: [ testRecipeOne.id, testRecipeTwo.id ],
                [ `${Properties.settings.collectionNames.item}.${testRecipeOne.itemUuid}` ]: [ testRecipeOne.id ],
                [ `${Properties.settings.collectionNames.item}.${testRecipeTwo.itemUuid}` ]: [ testRecipeTwo.id ]
            }
        };

        const underTest = new EntityDataStore({
            entityName: "Recipe",
            entityFactory: { make: () => undefined },
            collectionManager: new RecipeCollectionManager(),
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>(serializedData)
        });

        await expect(() => underTest.getById(testRecipeOne.id)).rejects.toThrow("Failed to create Recipe from JSON:");
        await expect(underTest.getCollection(testCraftingSystemOne.id, Properties.settings.collectionNames.craftingSystem)).rejects.toThrow("Failed to create Recipe from JSON:");

    });

    test('should successfully get entities from collection data without collection name prefixes', async () => {

        // Prepare the serialized data
        const serializedData: SerialisedEntityData<RecipeJson> = {
            entities: {
                [testRecipeOne.id]: testRecipeOne.toJson(),
                [testRecipeTwo.id]: testRecipeTwo.toJson()
            },
            collections: {
                [ testCraftingSystemOne.id ]: [ testRecipeOne.id, testRecipeTwo.id ],
                [ testRecipeOne.itemUuid ]: [ testRecipeOne.id ],
                [ testRecipeTwo.itemUuid ]: [ testRecipeTwo.id ]
            }
        };

        const underTest = new EntityDataStore({
            entityName: "Recipe",
            entityFactory: recipeFactory,
            collectionManager: {
                listCollectionMemberships() {
                    return []
                }
            },
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>(serializedData)
        });

        // Verify the entities are added correctly
        const allEntities = await underTest.getAllEntities();
        expect(allEntities.length).toEqual(2);
        expect(recipeInArray(testRecipeOne, allEntities)).toEqual(true);
        expect(recipeInArray(testRecipeTwo, allEntities)).toEqual(true);

        // Verify the crafting system collection is added correctly
        const craftingSystemCollection = await underTest.getCollection(testCraftingSystemOne.id);
        expect(craftingSystemCollection.length).toEqual(2);
        expect(recipeInArray(testRecipeOne, craftingSystemCollection)).toEqual(true);
        expect(recipeInArray(testRecipeTwo, craftingSystemCollection)).toEqual(true);

        // Verify the item UUID collections are added correctly
        const itemOneCollection = await underTest.getCollection(testRecipeOne.itemUuid);
        expect(itemOneCollection.length).toEqual(1);
        expect(recipeInArray(testRecipeOne, itemOneCollection)).toEqual(true);
        const itemTwoCollection = await underTest.getCollection(testRecipeTwo.itemUuid);
        expect(itemTwoCollection.length).toEqual(1);
        expect(recipeInArray(testRecipeTwo, itemTwoCollection)).toEqual(true);

    });

});

describe("Addition", () => {

    test("should add entities", async () => {

        const underTest = new EntityDataStore({
            entityName: "Recipe",
            entityFactory: recipeFactory,
            collectionManager: {
                listCollectionMemberships() {
                    return []
                }
            },
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>({ entities: {}, collections: {} })
        });

        await underTest.insert(testRecipeOne);
        await underTest.insert(testRecipeTwo);
        await underTest.insert(testRecipeThree);
        await underTest.insert(testRecipeFour);

        const allAfter = await underTest.getAllEntities();

        await expect(underTest.size()).resolves.toEqual(4);
        expect(allAfter.length).toEqual(4);
        await expect(underTest.collectionCount()).resolves.toEqual(0);

    });

    test("should add entities to collections", async () => {

        const underTest = new EntityDataStore({
            entityName: "Recipe",
            entityFactory: recipeFactory,
            collectionManager: new RecipeCollectionManager(),
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>({ entities: {}, collections: {} })
        });

        await underTest.insert(testRecipeOne);
        await underTest.insert(testRecipeTwo);
        await underTest.insert(testRecipeThree);

        const collectionAfter = await underTest.getCollection(testCraftingSystemOne.id, Properties.settings.collectionNames.craftingSystem);

        expect(collectionAfter).not.toBeNull();
        expect(collectionAfter.length).toEqual(3);
        expect(recipeInArray(testRecipeOne, collectionAfter)).toEqual(true);
        expect(recipeInArray(testRecipeTwo, collectionAfter)).toEqual(true);
        expect(recipeInArray(testRecipeThree, collectionAfter)).toEqual(true);

    });

});

describe("Deletion", () => {

    test("should delete and clean up member entities when deleting collections", async () => {

        const serializedData: SerialisedEntityData<RecipeJson> = {
            entities: {
                [testRecipeOne.id]: testRecipeOne.toJson(),
                [testRecipeTwo.id]: testRecipeTwo.toJson()
            },
            collections: {
                [ `${Properties.settings.collectionNames.craftingSystem}.${testCraftingSystemOne.id}` ]: [ testRecipeOne.id, testRecipeTwo.id ],
                [ `${Properties.settings.collectionNames.item}.${testRecipeOne.itemUuid}` ]: [ testRecipeOne.id ],
                [ `${Properties.settings.collectionNames.item}.${testRecipeTwo.itemUuid}` ]: [ testRecipeTwo.id ]
            }
        };

        const underTest = new EntityDataStore({
            entityName: "Recipe",
            entityFactory: recipeFactory,
            collectionManager: new RecipeCollectionManager(),
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>(serializedData)
        });

        const itemOneCollectionBefore = await underTest.getCollection(testRecipeOne.itemUuid, Properties.settings.collectionNames.item);
        expect(itemOneCollectionBefore).not.toBeNull();
        expect(itemOneCollectionBefore.length).toEqual(1);
        expect(recipeInArray(testRecipeOne, itemOneCollectionBefore)).toEqual(true);

        const deletedItemOneCollection = await underTest.deleteCollection(testRecipeOne.itemUuid, Properties.settings.collectionNames.item);

        expect(deletedItemOneCollection).toEqual(true);

        const itemOneCollectionAfter = await underTest.getCollection(testRecipeOne.itemUuid, Properties.settings.collectionNames.item);

        expect(itemOneCollectionAfter).not.toBeNull();
        expect(itemOneCollectionAfter.length).toEqual(0);

        const allAfter = await underTest.getAllEntities();

        expect(allAfter).not.toBeNull();
        expect(allAfter.length).toEqual(1);

        const craftingSystemCollectionAfter = await underTest.getCollection(testCraftingSystemOne.id, Properties.settings.collectionNames.craftingSystem);
        expect(craftingSystemCollectionAfter).not.toBeNull();
        expect(craftingSystemCollectionAfter.length).toEqual(1);
        expect(recipeInArray(testRecipeTwo, craftingSystemCollectionAfter)).toEqual(true);

        const itemTwoCollection = await underTest.getCollection(testRecipeTwo.itemUuid, Properties.settings.collectionNames.item);
        expect(itemTwoCollection).not.toBeNull();
        expect(itemTwoCollection.length).toEqual(1);
        expect(recipeInArray(testRecipeTwo, itemTwoCollection)).toEqual(true);

    });

    test("should remove entities from collections when they are deleted", async () => {

        const serializedData: SerialisedEntityData<RecipeJson> = {
            entities: {
                [testRecipeOne.id]: testRecipeOne.toJson(),
                [testRecipeTwo.id]: testRecipeTwo.toJson()
            },
            collections: {
                [ `${Properties.settings.collectionNames.craftingSystem}.${testCraftingSystemOne.id}` ]: [ testRecipeOne.id, testRecipeTwo.id ],
                [ `${Properties.settings.collectionNames.item}.${testRecipeOne.itemUuid}` ]: [ testRecipeOne.id ],
                [ `${Properties.settings.collectionNames.item}.${testRecipeTwo.itemUuid}` ]: [ testRecipeTwo.id ]
            }
        };

        const underTest = new EntityDataStore({
            entityName: "Recipe",
            entityFactory: recipeFactory,
            collectionManager: new RecipeCollectionManager(),
            settingManager: new StubSettingManager<SerialisedEntityData<RecipeJson>>(serializedData)
        });

        const allBefore = await underTest.getAllEntities();
        expect(allBefore.length).toEqual(2);
        expect(recipeInArray(testRecipeOne, allBefore)).toEqual(true);
        expect(recipeInArray(testRecipeTwo, allBefore)).toEqual(true);

        const craftingSystemCollectionBefore = await underTest.getCollection(testCraftingSystemOne.id, Properties.settings.collectionNames.craftingSystem);
        expect(craftingSystemCollectionBefore.length).toEqual(2);
        expect(recipeInArray(testRecipeOne, craftingSystemCollectionBefore)).toEqual(true);
        expect(recipeInArray(testRecipeTwo, craftingSystemCollectionBefore)).toEqual(true);

        const itemOneCollectionBefore = await underTest.getCollection(testRecipeOne.itemUuid, Properties.settings.collectionNames.item);
        expect(recipeInArray(testRecipeOne, itemOneCollectionBefore)).toEqual(true);

        const itemTwoCollectionBefore = await underTest.getCollection(testRecipeTwo.itemUuid, Properties.settings.collectionNames.item);
        expect(recipeInArray(testRecipeTwo, itemTwoCollectionBefore)).toEqual(true);

        const deleted = await underTest.deleteById(testRecipeOne.id);
        expect(deleted).toEqual(true);

        const allAfter = await underTest.getAllEntities();
        expect(allAfter.length).toEqual(1);
        expect(recipeInArray(testRecipeTwo, allAfter)).toEqual(true);

        const craftingSystemCollectionAfter = await underTest.getCollection(testCraftingSystemOne.id, Properties.settings.collectionNames.craftingSystem);
        expect(craftingSystemCollectionAfter.length).toEqual(1);
        expect(recipeInArray(testRecipeTwo, craftingSystemCollectionAfter)).toEqual(true);

        const itemOneCollectionAfter = await underTest.getCollection(testRecipeOne.itemUuid, Properties.settings.collectionNames.item);
        expect(itemOneCollectionAfter.length).toEqual(0);

        const itemTwoCollectionAfter = await underTest.getCollection(testRecipeTwo.itemUuid, Properties.settings.collectionNames.item);
        expect(itemTwoCollectionAfter.length).toEqual(1);
        expect(recipeInArray(testRecipeTwo, itemTwoCollectionAfter)).toEqual(true);

    });

});

function recipeInArray(expected: Recipe, known: Recipe[]): boolean {
    if (!known || known.length === 0) {
        return false;
    }
    return !!known.find(candidate => expected.equalsNotLoaded(candidate));
}
