import {beforeEach, describe, expect, test} from "@jest/globals";
import {DefaultCraftingSystemAPI} from "../src/scripts/api/CraftingSystemAPI";
import {StubIdentityFactory} from "./stubs/foundry/StubIdentityFactory";
import {StubLocalizationService} from "./stubs/foundry/StubLocalizationService";
import {StubNotificationService} from "./stubs/foundry/StubNotificationService";
import Properties from "../src/scripts/Properties";
import {CraftingSystemDetails} from "../src/scripts/crafting/system/CraftingSystemDetails";
import {EntityDataStore, SerialisedEntityData} from "../src/scripts/repository/EntityDataStore";
import {DefaultCraftingSystem, CraftingSystemJson} from "../src/scripts/crafting/system/CraftingSystem";
import {StubSettingManager} from "./stubs/foundry/StubSettingManager";
import {testCraftingSystemOne, testCraftingSystemTwo} from "./test_data/TestCrafingSystem";
import {StubEntityFactory} from "./stubs/StubEntityFactory";
import {CraftingSystemCollectionManager} from "../src/scripts/repository/CollectionManager";
import {CraftingSystemValidator} from "../src/scripts/crafting/system/CraftingSystemValidator";


const defaultSettingValue = (): SerialisedEntityData<CraftingSystemJson> => {
    return {
        entities: {
            [ testCraftingSystemOne.id ]: testCraftingSystemOne.toJson(),
            [ testCraftingSystemTwo.id ]: testCraftingSystemTwo.toJson()
        },
        collections: {}
    }
}

const settingManager = new StubSettingManager<SerialisedEntityData<CraftingSystemJson>>(defaultSettingValue());

const craftingSystemValidator = new CraftingSystemValidator();
const localizationService = new StubLocalizationService();
const notificationService = new StubNotificationService();
const stubCraftingSystemFactory = new StubEntityFactory<CraftingSystemJson, DefaultCraftingSystem>(
    {
        valuesById: new Map([
            [testCraftingSystemOne.id, testCraftingSystemOne],
            [testCraftingSystemTwo.id, testCraftingSystemTwo]
        ])
    });

beforeEach(() => {
    settingManager.reset(defaultSettingValue());
    notificationService.reset();
});

describe("Create", () => {

    test("should create a new crafting system with details", async () => {

        const craftingSystemStore = new EntityDataStore({
            entityName: "CraftingSystem",
            settingManager,
            entityFactory: stubCraftingSystemFactory,
            collectionManager: new CraftingSystemCollectionManager()
        });

        const expectedIdentity = "expected-identity";
        const expectedName = "Expected name";
        const expectedSummary = "Expected summary";
        const expectedDescription = "Expected description";
        const expectedAuthor = "Expected author";

        const underTest = new DefaultCraftingSystemAPI({
            notificationService,
            localizationService,
            craftingSystemValidator,
            user: "Game Master",
            craftingSystemStore,
            identityFactory: new StubIdentityFactory(expectedIdentity)
        });

        const result = await underTest.create({
            name: expectedName,
            summary: expectedSummary,
            description: expectedDescription,
            author: expectedAuthor
        });

        expect(result).not.toBeUndefined();
        expect(result.id).toEqual(expectedIdentity);
        expect(result.details.name).toEqual(expectedName);
        expect(result.details.summary).toEqual(expectedSummary);
        expect(result.details.description).toEqual(expectedDescription);
        expect(result.details.author).toEqual(expectedAuthor);

    });

    test("should create a new crafting system with default details", async () => {

        const craftingSystemStore = new EntityDataStore({
            entityName: "CraftingSystem",
            settingManager,
            entityFactory: stubCraftingSystemFactory,
            collectionManager: new CraftingSystemCollectionManager()
        });

        const expectedAuthor = "User";
        const underTest = new DefaultCraftingSystemAPI({
            notificationService,
            localizationService,
            craftingSystemValidator,
            user: expectedAuthor,
            craftingSystemStore,
            identityFactory: new StubIdentityFactory()
        });

        const result = await underTest.create();

        expect(result).not.toBeUndefined();
        expect(typeof result.id).toEqual("string");
        expect(result.details.name).toEqual(Properties.ui.defaults.craftingSystem.name);
        expect(result.details.summary).toEqual(Properties.ui.defaults.craftingSystem.summary);
        expect(result.details.description).toEqual(Properties.ui.defaults.craftingSystem.description);
        expect(result.details.author).toEqual(expectedAuthor);

    });

});

describe("Read", () => {

    test("should return crafting system if exists", async () => {

        const craftingSystemStore = new EntityDataStore({
            entityName: "CraftingSystem",
            settingManager,
            entityFactory: stubCraftingSystemFactory,
            collectionManager: new CraftingSystemCollectionManager()
        });

        const underTest = new DefaultCraftingSystemAPI({
            notificationService,
            localizationService,
            craftingSystemValidator,
            user: "User",
            craftingSystemStore,
            identityFactory: new StubIdentityFactory()
        });

        const result = await underTest.getById(testCraftingSystemOne.id);

        expect(result).not.toBeUndefined();
        expect(result.id).toEqual(testCraftingSystemOne.id);
        expect(result.details.name).toEqual(testCraftingSystemOne.details.name);
        expect(result.details.summary).toEqual(testCraftingSystemOne.details.summary);
        expect(result.details.description).toEqual(testCraftingSystemOne.details.description);
        expect(result.details.author).toEqual(testCraftingSystemOne.details.author);
        expect(result.isEmbedded).toEqual(testCraftingSystemOne.isEmbedded);
        expect(result.isDisabled).toEqual(testCraftingSystemOne.isDisabled);

    });

    test("should return embedded crafting system if exists", async () => {

        const craftingSystemStore = new EntityDataStore({
            entityName: "CraftingSystem",
            settingManager,
            entityFactory: stubCraftingSystemFactory,
            collectionManager: new CraftingSystemCollectionManager()
        });

        const underTest = new DefaultCraftingSystemAPI({
            notificationService,
            localizationService,
            craftingSystemValidator,
            user: "User",
            craftingSystemStore,
            identityFactory: new StubIdentityFactory()
        });

        const result = await underTest.getById(testCraftingSystemTwo.id);

        expect(result).not.toBeUndefined();
        expect(result.id).toEqual(testCraftingSystemTwo.id);
        expect(result.details.name).toEqual(testCraftingSystemTwo.details.name);
        expect(result.details.summary).toEqual(testCraftingSystemTwo.details.summary);
        expect(result.details.description).toEqual(testCraftingSystemTwo.details.description);
        expect(result.details.author).toEqual(testCraftingSystemTwo.details.author);
        expect(result.isEmbedded).toEqual(testCraftingSystemTwo.isEmbedded);
        expect(result.isDisabled).toEqual(testCraftingSystemTwo.isDisabled);

        await expect(craftingSystemStore.size()).resolves.toEqual(2);

    });

    test("should return undefined if system does not exist", async () => {

        const craftingSystemStore = new EntityDataStore({
            entityName: "CraftingSystem",
            settingManager,
            entityFactory: stubCraftingSystemFactory,
            collectionManager: new CraftingSystemCollectionManager()
        });

        const underTest = new DefaultCraftingSystemAPI({
            notificationService,
            localizationService,
            craftingSystemValidator,
            user: "User",
            craftingSystemStore,
            identityFactory: new StubIdentityFactory()
        });

        await expect(underTest.getById("non-existent")).resolves.toBeUndefined();

    });

});

describe("Update", () => {

    test("should fail to save a new crafting system with the same ID as an embedded system", async () => {

        const craftingSystemStore = new EntityDataStore({
            entityName: "CraftingSystem",
            settingManager,
            entityFactory: stubCraftingSystemFactory,
            collectionManager: new CraftingSystemCollectionManager()
        });

        const underTest = new DefaultCraftingSystemAPI({
            notificationService,
            localizationService,
            craftingSystemValidator,
            user: "User",
            craftingSystemStore,
            identityFactory: new StubIdentityFactory()
        });

        await expect(underTest.save(
            new DefaultCraftingSystem({
                id: testCraftingSystemTwo.id,
                craftingSystemDetails: new CraftingSystemDetails({
                    name: "Any name",
                    summary: "Any summary",
                    description: "Any description",
                    author: "Any author"
                }),
                embedded: false
            })
        ))
            .rejects
            .toThrowError();

        await expect(craftingSystemStore.size()).resolves.toEqual(2);
        const allEntities = await craftingSystemStore.getAllEntities();
        expect(allEntities.length).toEqual(2);

        expect(notificationService.invocations.length).toEqual(1);
        expect(notificationService.invocations[0].level).toEqual("error");
    });

    test("should allow an embedded system with `isDisabled` toggled as the only change to be saved", async () => {

        const craftingSystemStore = new EntityDataStore({
            entityName: "CraftingSystem",
            settingManager,
            entityFactory: stubCraftingSystemFactory,
            collectionManager: new CraftingSystemCollectionManager()
        });

        const underTest = new DefaultCraftingSystemAPI({
            notificationService,
            localizationService,
            craftingSystemValidator,
            user: "User",
            craftingSystemStore,
            identityFactory: new StubIdentityFactory()
        });

        const testCraftingSystemTwoClone = testCraftingSystemTwo.clone({ id: testCraftingSystemTwo.id, embedded: true });
        testCraftingSystemTwoClone.isDisabled = !testCraftingSystemTwoClone.isDisabled;
        const saved = await underTest.save(testCraftingSystemTwoClone);

        expect(saved.equals(testCraftingSystemTwo, true)).toBe(true);
        await expect(craftingSystemStore.size()).resolves.toEqual(2);
        const allEntities = await craftingSystemStore.getAllEntities();
        expect(allEntities.length).toEqual(2);

        expect(notificationService.invocations.length).toEqual(1);
        expect(notificationService.invocations[0].level).toEqual("info");
    });

    test("should update system if exists and changes valid", async () => {

        const craftingSystemStore = new EntityDataStore({
            entityName: "CraftingSystem",
            settingManager,
            entityFactory: stubCraftingSystemFactory,
            collectionManager: new CraftingSystemCollectionManager()
        });

        const underTest = new DefaultCraftingSystemAPI({
            notificationService,
            localizationService,
            craftingSystemValidator,
            user: "User",
            craftingSystemStore,
            identityFactory: new StubIdentityFactory()
        });

        const expectedName = "New name";
        const update = testCraftingSystemOne.clone({
            id: testCraftingSystemOne.id,
            name: expectedName,
            embedded: false
        });

        const updated = await underTest.save(update);
        expect(updated).not.toBeUndefined();
        expect(updated.id).toEqual(testCraftingSystemOne.id);
        expect(updated.details.name).toEqual(expectedName);
        expect(updated.details.summary).toEqual(testCraftingSystemOne.details.summary);
        expect(updated.details.description).toEqual(testCraftingSystemOne.details.description);
        expect(updated.details.author).toEqual(testCraftingSystemOne.details.author);

    });

    test("should reject update if system changes are not valid", async () => {

        const craftingSystemStore = new EntityDataStore({
            entityName: "CraftingSystem",
            settingManager,
            entityFactory: stubCraftingSystemFactory,
            collectionManager: new CraftingSystemCollectionManager()
        });

        const underTest = new DefaultCraftingSystemAPI({
            notificationService,
            localizationService,
            craftingSystemValidator,
            user: "User",
            craftingSystemStore,
            identityFactory: new StubIdentityFactory()
        });

        const expectedName = "";
        const update = testCraftingSystemOne.clone({
            id: testCraftingSystemOne.id,
            name: expectedName,
            embedded: false
        });

       await expect(underTest.save(update))
           .rejects
           .toThrowError();

        expect(notificationService.invocations.length).toEqual(1);
        expect(notificationService.invocations[0].level).toEqual("error");

    });

});

describe("Delete", () => {

    test("should delete system if exists", async () => {

        const craftingSystemStore = new EntityDataStore({
            entityName: "CraftingSystem",
            settingManager,
            entityFactory: stubCraftingSystemFactory,
            collectionManager: new CraftingSystemCollectionManager()
        });

        const underTest = new DefaultCraftingSystemAPI({
            notificationService,
            localizationService,
            craftingSystemValidator,
            user: "User",
            craftingSystemStore,
            identityFactory: new StubIdentityFactory()
        });

        const deleted = await underTest.deleteById(testCraftingSystemOne.id);
        expect(deleted).not.toBeUndefined();
        expect(deleted.id).toEqual(testCraftingSystemOne.id);

    });

    test("should return undefined if system does not exist", async () => {

        const craftingSystemStore = new EntityDataStore({
            entityName: "CraftingSystem",
            settingManager,
            entityFactory: stubCraftingSystemFactory,
            collectionManager: new CraftingSystemCollectionManager()
        });

        const underTest = new DefaultCraftingSystemAPI({
            notificationService,
            localizationService,
            craftingSystemValidator,
            user: "User",
            craftingSystemStore,
            identityFactory: new StubIdentityFactory()
        });

        await expect(underTest.deleteById("non-existent")).resolves.toBeUndefined();

    });

    test("should fail to delete an embedded crafting system", async () => {

        const craftingSystemStore = new EntityDataStore({
            entityName: "CraftingSystem",
            settingManager,
            entityFactory: stubCraftingSystemFactory,
            collectionManager: new CraftingSystemCollectionManager()
        });

        const underTest = new DefaultCraftingSystemAPI({
            notificationService,
            localizationService,
            craftingSystemValidator,
            user: "User",
            craftingSystemStore,
            identityFactory: new StubIdentityFactory()
        });

        await expect(underTest.deleteById(testCraftingSystemTwo.id))
            .rejects
            .toThrowError();

        expect(notificationService.invocations.length).toEqual(1);
        expect(notificationService.invocations[0].level).toEqual("error");

    });

});