import { describe, test, expect } from "@jest/globals";
import { EntityDataStore } from "../src/scripts/api/EntityDataStore";
import {testRecipeFour, testRecipeOne, testRecipeThree, testRecipeTwo} from "./test_data/TestRecipes";
import {testCraftingSystem} from "./test_data/TestCrafingSystem";
import {Recipe, RecipeJson} from "../src/scripts/crafting/recipe/Recipe";
import {allTestEssences} from "./test_data/TestEssences";
import {allTestComponents} from "./test_data/TestCraftingComponents";
import {StubDocumentManager} from "./stubs/StubDocumentManager";
import {RecipeFactory} from "../src/scripts/crafting/recipe/RecipeFactory";

const stubDocumentManager = new StubDocumentManager({
    itemDataByUuid: new Map([
        [ testRecipeOne.itemUuid, testRecipeOne.itemData ],
        [ testRecipeTwo.itemUuid, testRecipeTwo.itemData ],
        [ testRecipeThree.itemUuid, testRecipeThree.itemData ],
        [ testRecipeFour.itemUuid, testRecipeFour.itemData ]
    ])
});

const recipeFactory = new RecipeFactory({
    documentManager: stubDocumentManager,
    essences: allTestEssences,
    components: allTestComponents
});

describe('Deserialization', () => {

    test('should fail to deserialize from invalid json data', () => {

        expect(() => EntityDataStore.fromJson<RecipeJson, Recipe>(
            "Recipe",
            "{}",
            recipeFactory
        )).toThrow("The data source for the Recipe store is missing the required property \"entities\"");

        expect(() => EntityDataStore.fromJson<RecipeJson, Recipe>(
            "Recipe",
            `{ "entities": [] }`,
            recipeFactory
        )).toThrow("The data source for the Recipe store is missing the required property \"collections\"");

        expect(() => EntityDataStore.fromJson<RecipeJson, Recipe>(
            "Recipe",
            `NOT_VALID_JSON`,
            recipeFactory
        )).toThrow("The data source for the Recipe store is not valid JSON");

    });

    test("should initialise but not deserialize when recipe factory does not have required essences or components", () => {

        // Prepare the serialized data
        const serializedData: string = JSON.stringify({
            entities: [ testRecipeOne.toJson(), testRecipeTwo.toJson() ],
            collections: {
                [ testCraftingSystem.id ]: [ testRecipeOne.id, testRecipeTwo.id ],
                [ testRecipeOne.itemUuid ]: [ testRecipeOne.id ],
                [ testRecipeTwo.itemUuid ]: [ testRecipeTwo.id ]
            }
        });

        const underTest = EntityDataStore.fromJson<RecipeJson, Recipe>(
            "Recipe",
            serializedData,
            new RecipeFactory()
        );

        expect(() => underTest.getEntity(testRecipeOne.id)).toThrow();

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
            recipeFactory
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
        const underTest = EntityDataStore.fromJson<RecipeJson, Recipe>(
            "Recipe",
            serializedData,
            recipeFactory
        );

        // Verify the entities are added correctly
        const allEntities = underTest.getAllEntities();
        expect(allEntities.length).toEqual(2);
        expect(recipeInArray(testRecipeOne, allEntities)).toEqual(true);
        expect(recipeInArray(testRecipeTwo, allEntities)).toEqual(true);

        // Verify the crafting system collection is added correctly
        const craftingSystemCollection = underTest.getCollection(testCraftingSystem.id, craftingSystemCollectionPrefix);
        expect(craftingSystemCollection.length).toEqual(2);
        expect(recipeInArray(testRecipeOne, craftingSystemCollection)).toEqual(true);
        expect(recipeInArray(testRecipeTwo, craftingSystemCollection)).toEqual(true);

        // Verify the item UUID collections are added correctly
        const itemOneCollection = underTest.getCollection(testRecipeOne.itemUuid, itemCollectionPrefix);
        expect(itemOneCollection.length).toEqual(1);
        expect(recipeInArray(testRecipeOne, itemOneCollection)).toEqual(true);
        const itemTwoCollection = underTest.getCollection(testRecipeTwo.itemUuid, itemCollectionPrefix);
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
        const underTest = EntityDataStore.fromJson<RecipeJson, Recipe>(
            "Recipe",
            serializedData,
            recipeFactory
        );

        // Verify the entity is added correctly
        const allEntities = underTest.getAllEntities();
        expect(allEntities.length).toEqual(1);
        expect(recipeInArray(testRecipeOne, allEntities)).toEqual(true);

        // Verify the crafting system collection is added as expected
        const craftingSystemCollection = underTest.getCollection(testCraftingSystem.id, craftingSystemCollectionPrefix);
        expect(craftingSystemCollection.length).toEqual(3);
        expect(recipeInArray(testRecipeOne, craftingSystemCollection)).toEqual(true);
        expect(craftingSystemCollection.find(recipe => recipe?.id === testRecipeTwo.id)).toBeUndefined()
        expect(craftingSystemCollection.find(recipe => recipe?.id === testRecipeThree.id)).toBeUndefined()

        // Verify the item UUID collections are added as expected
        const itemOneCollection = underTest.getCollection(testRecipeOne.itemUuid, itemCollectionPrefix);
        expect(itemOneCollection.length).toEqual(0);
        const itemTwoCollection = underTest.getCollection(testRecipeTwo.itemUuid, itemCollectionPrefix);
        expect(itemTwoCollection.length).toEqual(1);
        expect(itemTwoCollection.find(recipe => recipe?.id === testRecipeTwo.id)).toBeUndefined();
        const itemThreeCollection = underTest.getCollection(testRecipeThree.itemUuid, itemCollectionPrefix);
        expect(itemThreeCollection.length).toEqual(0);

    });

});

describe("Serialization", () => {

    test("should serialise an empty Entity Data Store with all required properties", () => {

        // @ts-ignore
        const expected = { entities: [], collections: {} };

        const underTest = new EntityDataStore({ entityFactory: recipeFactory });

        const result = underTest.toJson();

        expect(JSON.parse(result)).toMatchSnapshot(expected);

    });

    test("should not serialise empty collections", () => {

        // @ts-ignore
        const expected = { entities: [], collections: {} };

        const underTest = new EntityDataStore({
            collections: new Map<string, Set<string>>([
                [ "A", new Set() ],
                [ "B", new Set() ]
            ]),
            entityFactory: recipeFactory
        });

        const result = underTest.toJson();

        expect(JSON.parse(result)).toMatchSnapshot(expected);

    });

    test("should correctly serialise an Entity Data Store with entities not in collections", () => {

        const underTest = new EntityDataStore({
            entitiesJsonById: new Map([
                [ testRecipeOne.id, testRecipeOne.toJson() ],
                [ testRecipeTwo.id, testRecipeTwo.toJson() ],
                [ testRecipeThree.id, testRecipeThree.toJson() ]
            ]),
            entityFactory: recipeFactory
        });

        const result = underTest.toJson();

        const deserializedResult = JSON.parse(result);
        expect(recipeJsonInArray(testRecipeOne.toJson(), deserializedResult.entities)).toEqual(true);
        expect(recipeJsonInArray(testRecipeTwo.toJson(), deserializedResult.entities)).toEqual(true);
        expect(recipeJsonInArray(testRecipeThree.toJson(), deserializedResult.entities)).toEqual(true);
        expect(Object.keys(deserializedResult.collections).length).toEqual(0);

    });

    test("should correctly serialise an Entity Data Store with entities in collections", () => {

        const craftingSystemCollectionKey = `CraftingSystem.${testCraftingSystem.id}`;
        const itemOneCollectionKey = `Item.${testRecipeOne.itemUuid}`;
        const itemTwoCollectionKey = `Item.${testRecipeTwo.itemUuid}`;
        const itemThreeCollectionKey = `Item.${testRecipeThree.itemUuid}`;

        const expected = {
            entities: [
                testRecipeOne.toJson(),
                testRecipeTwo.toJson(),
                testRecipeThree.toJson()
            ],
            collections: {
                [ craftingSystemCollectionKey ]: [
                    testRecipeOne.id,
                    testRecipeTwo.id,
                    testRecipeThree.id
                ],
                [ itemOneCollectionKey ] : [ testRecipeOne.id ],
                [ itemTwoCollectionKey ] : [ testRecipeTwo.id ],
                [ itemThreeCollectionKey ] : [ testRecipeThree.id ],
            }
        };

        const underTest = new EntityDataStore({
            entitiesJsonById: new Map([
                [ testRecipeOne.id, testRecipeOne.toJson() ],
                [ testRecipeTwo.id, testRecipeTwo.toJson() ],
                [ testRecipeThree.id, testRecipeThree.toJson() ]
            ]),
            entityFactory: recipeFactory,
            collections: new Map([
                [craftingSystemCollectionKey, new Set([ testRecipeOne.id, testRecipeTwo.id, testRecipeThree.id ]) ],
                [ itemOneCollectionKey, new Set([ testRecipeOne.id ]) ],
                [ itemTwoCollectionKey, new Set([ testRecipeTwo.id ]) ],
                [ itemThreeCollectionKey, new Set([ testRecipeThree.id ]) ]
            ])
        });

        const result = underTest.toJson();

        const deserializedResult = JSON.parse(result);
        expect(recipeJsonInArray(testRecipeOne.toJson(), deserializedResult.entities)).toEqual(true);
        expect(recipeJsonInArray(testRecipeTwo.toJson(), deserializedResult.entities)).toEqual(true);
        expect(recipeJsonInArray(testRecipeThree.toJson(), deserializedResult.entities)).toEqual(true);
        expect(Object.keys(deserializedResult.collections).length).toEqual(4);
        expect(deserializedResult.collections[craftingSystemCollectionKey]).toEqual(expected.collections[craftingSystemCollectionKey]);
        expect(deserializedResult.collections[itemOneCollectionKey]).toEqual(expected.collections[itemOneCollectionKey]);
        expect(deserializedResult.collections[itemTwoCollectionKey]).toEqual(expected.collections[itemTwoCollectionKey]);
        expect(deserializedResult.collections[itemThreeCollectionKey]).toEqual(expected.collections[itemThreeCollectionKey]);

    });

});

describe("Addition", () => {

    test("should add entities", () => {

        const underTest = new EntityDataStore<RecipeJson, Recipe>({ entityFactory: recipeFactory });

        underTest.insert(testRecipeOne);
        underTest.insert(testRecipeTwo);
        underTest.insert(testRecipeThree);
        underTest.insert(testRecipeFour);

        const allAfter = underTest.getAllEntities();

        expect(underTest.size).toEqual(4);
        expect(allAfter.length).toEqual(4);
        expect(underTest.collectionCount).toEqual(0);

    });

    test("should add entities to collections", () => {

        const underTest = new EntityDataStore({
            entitiesJsonById: new Map([
                [ testRecipeOne.id, testRecipeOne.toJson() ],
                [ testRecipeTwo.id, testRecipeTwo.toJson() ],
                [ testRecipeThree.id, testRecipeThree.toJson() ]
            ]),
            entityFactory: recipeFactory
        });

        const collectionPrefix = `CraftingSystem.`;
        const collectionName = testCraftingSystem.id;

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

    test("should return false when deleting non-existent collections", () => {

        const underTest = new EntityDataStore({ entityFactory: recipeFactory });

        const craftingSystemCollectionPrefix = "CraftingSystem.";

        const result = underTest.removeCollection(testCraftingSystem.id, craftingSystemCollectionPrefix);

        expect(result).toEqual(false);

    });

    test("should return false when removing non-existent entries in collections", () => {

        const underTest = new EntityDataStore({ entityFactory: recipeFactory });

        const craftingSystemCollectionPrefix = "CraftingSystem.";

        const result = underTest.removeFromCollection(testRecipeOne.id, testCraftingSystem.id, craftingSystemCollectionPrefix);

        expect(result).toEqual(false);

    });

    test("should delete linked entities when deleting collections", () => {

        const underTest = new EntityDataStore({
            entitiesJsonById: new Map([
                [ testRecipeOne.id, testRecipeOne.toJson() ],
                [ testRecipeTwo.id, testRecipeTwo.toJson() ],
                [ testRecipeThree.id, testRecipeThree.toJson() ]
            ]),
            entityFactory: recipeFactory,
            collections: new Map([
                [`CraftingSystem.${testCraftingSystem.id}`, new Set([ testRecipeOne.id, testRecipeTwo.id, testRecipeThree.id ]) ],
                [ `Item.${testRecipeOne.itemUuid}`, new Set([ testRecipeOne.id ]) ],
                [ `Item.${testRecipeTwo.itemUuid}`, new Set([ testRecipeTwo.id ]) ],
                [ `Item.${testRecipeThree.itemUuid}`, new Set([ testRecipeThree.id ]) ]
            ])
        });

        const craftingSystemCollectionPrefix = "CraftingSystem.";
        const itemCollectionPrefix = "Item.";

        const result = underTest.removeCollection(testCraftingSystem.id, craftingSystemCollectionPrefix);

        expect(result).toEqual(true);

        const craftingSystemCollectionAfter = underTest.getCollection(testCraftingSystem.id, craftingSystemCollectionPrefix);

        expect(craftingSystemCollectionAfter).not.toBeNull();
        expect(craftingSystemCollectionAfter.length).toEqual(0);

        const allAfter = underTest.getAllEntities();

        expect(allAfter).not.toBeNull();
        expect(allAfter.length).toEqual(0);

        const itemOneCollection = underTest.getCollection(testRecipeOne.itemUuid, itemCollectionPrefix);
        expect(itemOneCollection.length).toEqual(0);

        const itemTwoCollection = underTest.getCollection(testRecipeTwo.itemUuid, itemCollectionPrefix);
        expect(itemTwoCollection.length).toEqual(0);

        const itemThreeCollection = underTest.getCollection(testRecipeThree.itemUuid, itemCollectionPrefix);
        expect(itemThreeCollection.length).toEqual(0);

    });

    test("should remove entities from collections without deleting them", () => {

        const underTest = new EntityDataStore({
            entitiesJsonById: new Map([
                [ testRecipeOne.id, testRecipeOne.toJson() ],
                [ testRecipeTwo.id, testRecipeTwo.toJson() ],
                [ testRecipeThree.id, testRecipeThree.toJson() ]
            ]),
            entityFactory: recipeFactory,
            collections: new Map([
                [`CraftingSystem.${testCraftingSystem.id}`, new Set([ testRecipeOne.id, testRecipeTwo.id, testRecipeThree.id ]) ],
                [ `Item.${testRecipeOne.itemUuid}`, new Set([ testRecipeOne.id ]) ],
                [ `Item.${testRecipeTwo.itemUuid}`, new Set([ testRecipeTwo.id ]) ],
                [ `Item.${testRecipeThree.itemUuid}`, new Set([ testRecipeThree.id ]) ]
            ])
        });

        const craftingSystemCollectionPrefix = "CraftingSystem.";
        const itemCollectionPrefix = "Item.";

        const removeFromSystemResult = underTest.removeFromCollection(testRecipeOne.id, testCraftingSystem.id, craftingSystemCollectionPrefix);
        expect(removeFromSystemResult).toEqual(true);

        const removeFromItemOneResult = underTest.removeFromCollection(testRecipeOne.id, testRecipeOne.itemUuid, itemCollectionPrefix);
        expect(removeFromItemOneResult).toEqual(true);

        const craftingSystemCollectionAfter = underTest.getCollection(testCraftingSystem.id, craftingSystemCollectionPrefix);

        expect(craftingSystemCollectionAfter).not.toBeNull();
        expect(craftingSystemCollectionAfter.length).toEqual(2);
        expect(recipeInArray(testRecipeOne, craftingSystemCollectionAfter)).toEqual(false);
        expect(recipeInArray(testRecipeTwo, craftingSystemCollectionAfter)).toEqual(true);
        expect(recipeInArray(testRecipeThree, craftingSystemCollectionAfter)).toEqual(true);

        const allAfter = underTest.getAllEntities();

        expect(allAfter).not.toBeNull();
        expect(allAfter.length).toEqual(3);

        const itemOneCollection = underTest.getCollection(testRecipeOne.itemUuid, itemCollectionPrefix);
        expect(itemOneCollection.length).toEqual(0);

        const itemTwoCollection = underTest.getCollection(testRecipeTwo.itemUuid, itemCollectionPrefix);
        expect(itemTwoCollection.length).toEqual(1);
        expect(recipeInArray(testRecipeTwo, itemTwoCollection)).toEqual(true);

        const itemThreeCollection = underTest.getCollection(testRecipeThree.itemUuid, itemCollectionPrefix);
        expect(itemThreeCollection.length).toEqual(1);
        expect(recipeInArray(testRecipeThree, itemThreeCollection)).toEqual(true);

    });

});

function recipeInArray(expected: Recipe, known: Recipe[]): boolean {
    if (!known || known.length === 0) {
        return false;
    }
    return !!known.find(candidate => expected.equalsNotLoaded(candidate));
}

function recipeJsonInArray(expected: RecipeJson, known: RecipeJson[]): boolean {
    if (!known || known.length === 0) {
        return false;
    }
    return !!known.find(candidate => expected.id === candidate.id);
}
