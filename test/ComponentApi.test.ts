import {beforeEach, describe, expect, test} from "@jest/globals";
import {StubCraftingSystemApi} from "./stubs/api/StubCraftingSystemApi";
import {StubEssenceApi} from "./stubs/api/StubEssenceApi";
import {StubLocalizationService} from "./stubs/foundry/StubLocalizationService";
import {StubNotificationService} from "./stubs/foundry/StubNotificationService";
import {StubDocumentManager} from "./stubs/StubDocumentManager";
import {StubIdentityFactory} from "./stubs/foundry/StubIdentityFactory";
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
import {testCraftingSystemOne} from "./test_data/TestCrafingSystem";
import {DefaultComponentValidator} from "../src/scripts/crafting/component/ComponentValidator";
import {EntityDataStore, SerialisedEntityData} from "../src/scripts/repository/EntityDataStore";
import {ComponentJson} from "../src/scripts/crafting/component/Component";
import Properties from "../src/scripts/Properties";
import {DefaultComponentAPI} from "../src/scripts/api/ComponentAPI";
import {Component} from "../src/scripts/crafting/component/Component";
import {ComponentFactory} from "../src/scripts/crafting/component/ComponentFactory";
import {ComponentCollectionManager} from "../src/scripts/repository/CollectionManager";

const identityFactory = new StubIdentityFactory();
const localizationService = new StubLocalizationService();
const notificationService = new StubNotificationService();
const craftingSystemAPI = new StubCraftingSystemApi({
    valuesById: new Map([[testCraftingSystemOne.id, testCraftingSystemOne]])
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
const componentValidator = new DefaultComponentValidator({
    craftingSystemAPI,
    essenceAPI
});
const defaultSettingValue: () => SerialisedEntityData<ComponentJson> = () => {
   return {
        entities: {
            [ testComponentOne.id ]: testComponentOne.toJson(),
            [ testComponentTwo.id ]: testComponentTwo.toJson(),
            [ testComponentThree.id ]: testComponentThree.toJson(),
            [ testComponentFour.id ]: testComponentFour.toJson(),
            [ testComponentFive.id ]: testComponentFive.toJson(),
            [ testComponentSix.id ]: testComponentSix.toJson(),
            [ testComponentSeven.id ]: testComponentSeven.toJson()
        },
       collections: {
            [ `${Properties.settings.collectionNames.item}.${testComponentOne.itemUuid}` ]: [ testComponentOne.id ],
            [ `${Properties.settings.collectionNames.item}.${testComponentTwo.itemUuid}` ]: [ testComponentTwo.id ],
            [ `${Properties.settings.collectionNames.item}.${testComponentThree.itemUuid}` ]: [ testComponentThree.id ],
            [ `${Properties.settings.collectionNames.item}.${testComponentFour.itemUuid}` ]: [ testComponentFour.id ],
            [ `${Properties.settings.collectionNames.item}.${testComponentFive.itemUuid}` ]: [ testComponentFive.id ],
            [ `${Properties.settings.collectionNames.item}.${testComponentSix.itemUuid}` ]: [ testComponentSix.id ],
            [ `${Properties.settings.collectionNames.item}.${testComponentSeven.itemUuid}` ]: [ testComponentSeven.id ],
            [ `${Properties.settings.collectionNames.craftingSystem}.${testCraftingSystemOne.id}` ]: [
                testComponentOne.id,
                testComponentTwo.id,
                testComponentThree.id,
                testComponentFour.id,
                testComponentFive.id,
                testComponentSix.id,
                testComponentSeven.id
            ]
       }
    };
};
const settingManager = new StubSettingManager<SerialisedEntityData<ComponentJson>>(defaultSettingValue());

beforeEach(() => {
    settingManager.reset(defaultSettingValue());
    documentManager.reset();
});

describe("Create", () => {

    test("Create a new component", async () => {

        const componentStore = new EntityDataStore<ComponentJson, Component>({
            entityName: "Component",
            settingManager,
            collectionManager: new ComponentCollectionManager(),
            entityFactory: new ComponentFactory({ documentManager }),
        });
        documentManager.setAllowUnknownIds(true);

        const underTest = new DefaultComponentAPI({
            identityFactory,
            localizationService,
            notificationService,
            componentStore,
            componentValidator
        });

        const result = await underTest.create({
            essences: {
                [elementalEarth.id]: 1
            },
            craftingSystemId: testCraftingSystemOne.id,
            itemUuid: "test-item-uuid"
        });

        expect(result).not.toBeUndefined();

    });

});

describe("Read", () => {



});

describe("Update", () => {



});

describe("Delete", () => {



});