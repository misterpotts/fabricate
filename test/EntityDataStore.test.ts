import { describe, test, expect } from "@jest/globals";
import { EntityDataStore } from "../src/scripts/api/EntityDataStore";
import {testRecipeFour, testRecipeOne, testRecipeThree, testRecipeTwo} from "./test_data/TestRecipes";
import {testCraftingSystem} from "./test_data/TestCrafingSystem";
import {Recipe, RecipeJson} from "../src/scripts/crafting/recipe/Recipe";
import {allTestEssences} from "./test_data/TestEssences";
import {allTestComponents} from "./test_data/TestCraftingComponents";

describe('Deserialization', () => {

    test('should fail to deserialize from invalid json data', () => {

        expect(() => EntityDataStore.fromJson<RecipeJson, Recipe>(
            "Recipe",
            "{}",
            Recipe.fromJson,
            new Map([
                [ testRecipeOne.itemUuid, testRecipeOne.itemData ],
                [ testRecipeTwo.itemUuid, testRecipeTwo.itemData ]
            ]),
            allTestEssences,
            allTestComponents
        )).toThrow("The data source for the Recipe store is missing the required property \"entities\"");

        expect(() => EntityDataStore.fromJson<RecipeJson, Recipe>(
            "Recipe",
            `{ "entities": [] }`,
            Recipe.fromJson,
            new Map([
                [ testRecipeOne.itemUuid, testRecipeOne.itemData ],
                [ testRecipeTwo.itemUuid, testRecipeTwo.itemData ]
            ]),
            allTestEssences,
            allTestComponents
        )).toThrow("The data source for the Recipe store is missing the required property \"collections\"");

        expect(() => EntityDataStore.fromJson<RecipeJson, Recipe>(
            "Recipe",
            `NOT_VALID_JSON`,
            Recipe.fromJson,
            new Map([
                [ testRecipeOne.itemUuid, testRecipeOne.itemData ],
                [ testRecipeTwo.itemUuid, testRecipeTwo.itemData ]
            ]),
            allTestEssences,
            allTestComponents
        )).toThrow("The data source for the Recipe store is not valid JSON");

    });

    test("should fail to deserialize when constructor function's requirements are not met", () => {

        // Prepare the serialized data
        const serializedData: string = JSON.stringify({
            entities: [ testRecipeOne.toJson(), testRecipeTwo.toJson() ],
            collections: {
                [ testCraftingSystem.id ]: [ testRecipeOne.id, testRecipeTwo.id ],
                [ testRecipeOne.itemUuid ]: [ testRecipeOne.id ],
                [ testRecipeTwo.itemUuid ]: [ testRecipeTwo.id ]
            }
        });

        expect(() => EntityDataStore.fromJson<RecipeJson, Recipe>(
            "Recipe",
            serializedData,
            Recipe.fromJson,
            new Map([
                [ testRecipeOne.itemUuid, testRecipeOne.itemData ],
                [ testRecipeTwo.itemUuid, testRecipeTwo.itemData ]
            ]),
            new Map(),
            new Map()
        )).toThrow();

    });

    test('should successfully deserialize from valid json data without collection name prefixes', () => {

        // Prepare the serialized data
        const serializedData: string = JSON.stringify({
            entities: [ testRecipeOne.toJson(), testRecipeTwo.toJson() ],
            collections: {
                [ testCraftingSystem.id ]: [ testRecipeOne.id, testRecipeTwo.id ],
                [ testRecipeOne.itemUuid ]: [ testRecipeOne.id ],
                [ testRecipeTwo.itemUuid ]: [ testRecipeTwo.id ]
            }
        });

        // Use fromJson to create a new EntityDataStore
        const underTest = EntityDataStore.fromJson<RecipeJson, Recipe>(
            "Recipe",
            serializedData,
            Recipe.fromJson,
            new Map([
                [ testRecipeOne.itemUuid, testRecipeOne.itemData ],
                [ testRecipeTwo.itemUuid, testRecipeTwo.itemData ]
            ]),
            allTestEssences,
            allTestComponents
        );

        // Verify the entities are added correctly
        const allEntities = underTest.getAllEntities();
        expect(allEntities.length).toEqual(2);
        expect(recipeInArray(testRecipeOne, allEntities)).toEqual(true);
        expect(recipeInArray(testRecipeTwo, allEntities)).toEqual(true);

        // Verify the crafting system collection is added correctly
        const craftingSystemCollection = underTest.getCollection(testCraftingSystem.id);
        expect(craftingSystemCollection.length).toEqual(2);
        expect(recipeInArray(testRecipeOne, craftingSystemCollection)).toEqual(true);
        expect(recipeInArray(testRecipeTwo, craftingSystemCollection)).toEqual(true);

        // Verify the item UUID collections are added correctly
        const itemOneCollection = underTest.getCollection(testRecipeOne.itemUuid);
        expect(itemOneCollection.length).toEqual(1);
        expect(recipeInArray(testRecipeOne, itemOneCollection)).toEqual(true);
        const itemTwoCollection = underTest.getCollection(testRecipeTwo.itemUuid);
        expect(itemTwoCollection.length).toEqual(1);
        expect(recipeInArray(testRecipeTwo, itemTwoCollection)).toEqual(true);

    });

    test('should successfully deserialize from valid json data with collection name prefixes', () => {

        // Prepare the serialized data
        const craftingSystemCollectionPrefix = `CraftingSystem.`;
        const craftingSystemCollectionKey = `${craftingSystemCollectionPrefix}${testCraftingSystem.id}`;
        const itemCollectionPrefix = `Item.`;
        const itemOneCollectionKey = `${itemCollectionPrefix}${testRecipeOne.itemUuid}`;
        const itemTwoCollectionKey = `${itemCollectionPrefix}${testRecipeTwo.itemUuid}`;
        const serializedData: string = JSON.stringify({
            entities: [ testRecipeOne.toJson(), testRecipeTwo.toJson() ],
            collections: {
                [ craftingSystemCollectionKey ]: [ testRecipeOne.id, testRecipeTwo.id ],
                [ itemOneCollectionKey ]: [ testRecipeOne.id ],
                [ itemTwoCollectionKey ]: [ testRecipeTwo.id ]
            }
        })

        // Use fromJson to create a new EntityDataStore
        const dataStore = EntityDataStore.fromJson<RecipeJson, Recipe>(
            "Recipe",
            serializedData,
            Recipe.fromJson,
            new Map([
                [ testRecipeOne.itemUuid, testRecipeOne.itemData ],
                [ testRecipeTwo.itemUuid, testRecipeTwo.itemData ]
            ]),
            allTestEssences,
            allTestComponents
        );

        // Verify the entities are added correctly
        const allEntities = dataStore.getAllEntities();
        expect(allEntities.length).toEqual(2);
        expect(recipeInArray(testRecipeOne, allEntities)).toEqual(true);
        expect(recipeInArray(testRecipeTwo, allEntities)).toEqual(true);

        // Verify the crafting system collection is added correctly
        const craftingSystemCollection = dataStore.getCollection(testCraftingSystem.id, craftingSystemCollectionPrefix);
        expect(craftingSystemCollection.length).toEqual(2);
        expect(recipeInArray(testRecipeOne, craftingSystemCollection)).toEqual(true);
        expect(recipeInArray(testRecipeTwo, craftingSystemCollection)).toEqual(true);

        // Verify the item UUID collections are added correctly
        const itemOneCollection = dataStore.getCollection(testRecipeOne.itemUuid, itemCollectionPrefix);
        expect(itemOneCollection.length).toEqual(1);
        expect(recipeInArray(testRecipeOne, itemOneCollection)).toEqual(true);
        const itemTwoCollection = dataStore.getCollection(testRecipeTwo.itemUuid, itemCollectionPrefix);
        expect(itemTwoCollection.length).toEqual(1);
        expect(recipeInArray(testRecipeTwo, itemTwoCollection)).toEqual(true);

    });

    test('should successfully deserialize from valid but inaccurate json data', () => {

        // Prepare the serialized data
        const craftingSystemCollectionPrefix = `CraftingSystem.`;
        const craftingSystemCollectionKey = `${craftingSystemCollectionPrefix}${testCraftingSystem.id}`;
        const itemCollectionPrefix = `Item.`;
        const itemTwoCollectionKey = `${itemCollectionPrefix}${testRecipeTwo.itemUuid}`;
        const serializedData: string = JSON.stringify({
            entities: [ testRecipeOne.toJson() ],
            collections: {
                [ craftingSystemCollectionKey ]: [ testRecipeOne.id, testRecipeTwo.id, testRecipeThree.id ],
                [ itemTwoCollectionKey ]: [ testRecipeTwo.id ]
            }
        });

        // Use fromJson to create a new EntityDataStore
        const dataStore = EntityDataStore.fromJson<RecipeJson, Recipe>(
            "Recipe",
            serializedData,
            Recipe.fromJson,
            new Map([
                [ testRecipeOne.itemUuid, testRecipeOne.itemData ],
                [ testRecipeTwo.itemUuid, testRecipeTwo.itemData ]
            ]),
            allTestEssences,
            allTestComponents
        );

        // Verify the entity is added correctly
        const allEntities = dataStore.getAllEntities();
        expect(allEntities.length).toEqual(1);
        expect(recipeInArray(testRecipeOne, allEntities)).toEqual(true);

        // Verify the crafting system collection is added as expected
        const craftingSystemCollection = dataStore.getCollection(testCraftingSystem.id, craftingSystemCollectionPrefix);
        expect(craftingSystemCollection.length).toEqual(3);
        expect(recipeInArray(testRecipeOne, craftingSystemCollection)).toEqual(true);
        expect(craftingSystemCollection.find(recipe => recipe?.id === testRecipeTwo.id)).toBeUndefined()
        expect(craftingSystemCollection.find(recipe => recipe?.id === testRecipeThree.id)).toBeUndefined()

        // Verify the item UUID collections are added as expected
        const itemOneCollection = dataStore.getCollection(testRecipeOne.itemUuid, itemCollectionPrefix);
        expect(itemOneCollection.length).toEqual(0);
        const itemTwoCollection = dataStore.getCollection(testRecipeTwo.itemUuid, itemCollectionPrefix);
        expect(itemTwoCollection.length).toEqual(1);
        expect(itemTwoCollection.find(recipe => recipe?.id === testRecipeTwo.id)).toBeUndefined();
        const itemThreeCollection = dataStore.getCollection(testRecipeThree.itemUuid, itemCollectionPrefix);
        expect(itemThreeCollection.length).toEqual(0);

    });

});

describe("Serialization", () => {

    test("should serialise an empty Entity Data Store with all required properties", () => {

        // @ts-ignore
        const expected = { entities: [], collections: {} };

        const underTest = new EntityDataStore();

        const result = underTest.toJson();

        expect(JSON.parse(result)).toMatchSnapshot(expected);

    });

    test("should correctly serialise an Entity Data Store with entities not in collections", () => {

        // @ts-ignore
        const expected = { entities: [ testRecipeOne.toJson(), testRecipeTwo.toJson(), testRecipeThree.toJson() ], collections: {} };

        const underTest = new EntityDataStore({
            entities: new Map([
                [ testRecipeOne.id, testRecipeOne ],
                [ testRecipeTwo.id, testRecipeTwo ],
                [ testRecipeThree.id, testRecipeThree ]
            ])
        });

        const result = underTest.toJson();

        expect(JSON.parse(result)).toMatchSnapshot(expected);

    });

    test("should correctly serialise an Entity Data Store with entities in collections", () => {

        const expected = {
            entities: [
                testRecipeOne.toJson(),
                testRecipeTwo.toJson(),
                testRecipeThree.toJson()
            ],
            collections: {
                [ `CraftingSystem.${testCraftingSystem.id}` ]: [
                    testRecipeOne.id,
                    testRecipeTwo.id,
                    testRecipeThree.id
                ],
                [ `Item.${testRecipeOne.itemUuid}` ] : [ testRecipeOne.id ],
                [ `Item.${testRecipeTwo.itemUuid}` ] : [ testRecipeTwo.id ],
                [ `Item.${testRecipeThree.itemUuid}` ] : [ testRecipeThree.id ],
            }
        };

        const underTest = new EntityDataStore({
            entities: new Map([
                [ testRecipeOne.id, testRecipeOne ],
                [ testRecipeTwo.id, testRecipeTwo ],
                [ testRecipeThree.id, testRecipeThree ]
            ]),
            collections: new Map([
                [`CraftingSystem.${testCraftingSystem.id}`, new Set([ testRecipeOne.id, testRecipeTwo.id, testRecipeThree.id ]) ],
                [ `Item.${testRecipeOne.itemUuid}`, new Set([ testRecipeOne.id ]) ],
                [ `Item.${testRecipeTwo.itemUuid}`, new Set([ testRecipeTwo.id ]) ],
                [ `Item.${testRecipeThree.itemUuid}`, new Set([ testRecipeThree.id ]) ]
            ])
        });

        const result = underTest.toJson();

        expect(JSON.parse(result)).toMatchSnapshot(expected);

    });

});

describe("Addition", () => {

    test("should add entities", () => {

        const underTest = new EntityDataStore<RecipeJson, Recipe>();

        const allBefore = underTest.getAllEntities();

        expect(underTest.size).toEqual(0);
        expect(allBefore.length).toEqual(0);

        underTest.insertEntity(testRecipeOne);
        underTest.insertEntity(testRecipeTwo);
        underTest.insertEntity(testRecipeThree);
        underTest.insertEntity(testRecipeFour);

        const allAfter = underTest.getAllEntities();

        expect(underTest.size).toEqual(4);
        expect(allAfter.length).toEqual(4);
        expect(underTest.collectionCount).toEqual(0);

    });

    test("should add entities to collections", () => {

        const underTest = new EntityDataStore({
            entities: new Map([
                [ testRecipeOne.id, testRecipeOne ],
                [ testRecipeTwo.id, testRecipeTwo ],
                [ testRecipeThree.id, testRecipeThree ]
            ])
        });

        const collectionPrefix = `CraftingSystem.`;
        const collectionName = testCraftingSystem.id;
        const collectionBefore = underTest.getCollection(collectionName, collectionPrefix);

        expect(collectionBefore).not.toBeNull();
        expect(collectionBefore.length).toEqual(0);

        underTest.addToCollection(testRecipeOne.id, collectionName, collectionPrefix);
        underTest.addToCollection(testRecipeTwo.id, collectionName, collectionPrefix);

        const collectionAfter = underTest.getCollection(collectionName, collectionPrefix);

        expect(collectionAfter).not.toBeNull();
        expect(collectionAfter.length).toEqual(2);
        expect(recipeInArray(testRecipeOne, collectionAfter)).toEqual(true);
        expect(recipeInArray(testRecipeTwo, collectionAfter)).toEqual(true);

    });

});

describe("Deletion", () => {

    test("", () => {

    });

});

function recipeInArray(expected: Recipe, known: Recipe[]): boolean {
    if (!known || known.length === 0) {
        return false;
    }
    return !!known.find(candidate => expected.equals(candidate));
}
