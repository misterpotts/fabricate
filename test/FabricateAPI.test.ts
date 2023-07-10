import {describe, expect, test} from "@jest/globals";
import {DefaultFabricateAPIFactory} from "../src/scripts/api/FabricateAPI";
import {StubDocumentManager} from "./stubs/StubDocumentManager";
import {StubGameProvider} from "./stubs/foundry/StubGameProvider";
import {GameProvider} from "../src/scripts/foundry/GameProvider";
import {StubClientSettingsFactory} from "./stubs/foundry/StubClientSettings";
import Properties from "../src/scripts/Properties";
import {StubIdentityFactory} from "./stubs/foundry/StubIdentityFactory";
import {StubUIProvider} from "./stubs/foundry/StubUIProvider";
import {FabricateItemData, LoadedFabricateItemData} from "../src/scripts/foundry/DocumentManager";

function buildDefaultSettingsValue() {
    const defaultSettingsValues = new Map();
    defaultSettingsValues.set(Properties.module.id, new Map());
    defaultSettingsValues.get(Properties.module.id).set(Properties.settings.craftingSystems.key, {
        entities: {},
        collections: {}
    });
    defaultSettingsValues.get(Properties.module.id).set(Properties.settings.essences.key, {
        entities: {},
        collections: {}
    });
    defaultSettingsValues.get(Properties.module.id).set(Properties.settings.components.key, {
        entities: {},
        collections: {}
    });
    defaultSettingsValues.get(Properties.module.id).set(Properties.settings.recipes.key, {
        entities: {},
        collections: {}
    });
    return defaultSettingsValues;
}

describe("FabricateAPI component integration", () => {

    test("Create crafting system from scratch", async () => {

        // Prepare the test item data that would be provided by Foundry

        const testItemOneId = "testItemOneId";
        const testItemTwoId = "testItemTwoId";
        const testItemThreeId = "testItemThreeId";
        const testItemFourId = "testItemFourId";
        const testItemFiveId = "testItemFiveId";
        const testItemOneName = "Test Item One";
        const testItemOneImageUrl = "path/to/image/webp";
        const testItemFourName = "Test Item Four";
        const testItemFourImageUrl = "path/to/image/webp";
        const itemDataByUuid = new Map<string, FabricateItemData>([
            [ testItemOneId, new LoadedFabricateItemData({
                name: testItemOneName,
                imageUrl: testItemOneImageUrl,
                itemUuid: testItemOneId,
                sourceDocument: {}
            }) ],
            [ testItemTwoId, new LoadedFabricateItemData({
                name: "Test Item Two",
                imageUrl: "path/to/image/webp",
                itemUuid: testItemTwoId,
                sourceDocument: {}
            }) ],
            [ testItemThreeId, new LoadedFabricateItemData({
                name: "Test Item Three",
                imageUrl: "path/to/image/webp",
                itemUuid: testItemThreeId,
                sourceDocument: {}
            }) ],
            [ testItemFourId, new LoadedFabricateItemData({
                name: testItemFourName,
                imageUrl: testItemFourImageUrl,
                itemUuid: testItemFourId,
                sourceDocument: {}
            } )],
            [ testItemFiveId, new LoadedFabricateItemData({
                name: "Test Item Five",
                imageUrl: "path/to/image/webp",
                itemUuid: testItemFiveId,
                sourceDocument: {}
            }) ],
        ]);
        const documentManager = new StubDocumentManager({ itemDataByUuid });

        // Build the API factory's dependencies

        const gameProvider: GameProvider = new StubGameProvider();
        const uiProvider = new StubUIProvider();
        const defaultSettingsValue = buildDefaultSettingsValue();
        const clientSettings: ClientSettings = new StubClientSettingsFactory().make(defaultSettingsValue);
        const identityFactory = new StubIdentityFactory();

        const user = "Game Master";
        const gameSystem = "dnd5e";
        const fabricateAPIFactory = new DefaultFabricateAPIFactory({
            user,
            gameSystem,
            documentManager,
            clientSettings,
            gameProvider,
            identityFactory,
            uiProvider
        });

        // Create the test Fabricate API instance

        const underTest = fabricateAPIFactory.make();

        // Create the crafting system

        const craftingSystemOptions = {
            name: "Test Crafting System",
            summary: "Test Summary",
            description: "Test Description"
        };
        const craftingSystem = await underTest.craftingSystems.create(craftingSystemOptions);

        expect(craftingSystem).not.toBeUndefined();
        expect(craftingSystem.details.name).toEqual(craftingSystemOptions.name);
        expect(craftingSystem.details.summary).toEqual(craftingSystemOptions.summary);
        expect(craftingSystem.details.description).toEqual(craftingSystemOptions.description);
        expect(craftingSystem.details.author).toEqual(user);
        expect(craftingSystem.gameSystem).toEqual(gameSystem);

        // Create essences

        const essenceOne = await underTest.essences.create({
            name: "Essence One",
            craftingSystemId: craftingSystem.id
        });

        expect(essenceOne).not.toBeUndefined();

        const essenceTwo = await underTest.essences.create({
            name: "Essence Two",
            craftingSystemId: craftingSystem.id
        });

        expect(essenceTwo).not.toBeUndefined();

        const essenceThree = await underTest.essences.create({
            name: "Essence Three",
            craftingSystemId: craftingSystem.id
        });

        expect(essenceThree).not.toBeUndefined();

        // Create the first component

        const componentOne = await underTest.components.create({
            itemUuid: testItemOneId,
            craftingSystemId: craftingSystem.id,
        });

        expect(componentOne).not.toBeUndefined();
        expect(componentOne.itemUuid).toEqual(testItemOneId);

        await componentOne.load();

        expect(componentOne.craftingSystemId).toEqual(craftingSystem.id);
        expect(componentOne.name).toEqual(testItemOneName);
        expect(componentOne.imageUrl).toEqual(testItemOneImageUrl);

        // Create the second component

        const componentTwo = await underTest.components.create({
            itemUuid: testItemTwoId,
            craftingSystemId: craftingSystem.id,
            essences: {
                [ essenceTwo.id ]: 1
            }
        });

        // Create the third component

        const componentThree = await underTest.components.create({
            itemUuid: testItemThreeId,
            craftingSystemId: craftingSystem.id,
            essences: {
                [ essenceThree.id ]: 1
            }
        });

        // Add salvage options to the first component

        expect(componentOne.isSalvageable).toEqual(false);
        expect(componentOne.hasEssences).toEqual(false);

        componentOne.setSalvageOption({
            name: "salvageOptionOne",
            results: {
                [ componentTwo.id ]: 1
            },
            catalysts: {
                [ componentThree.id ]: 1
            }
        });

        componentOne.addEssence(essenceOne.id, 1);

        componentOne.salvageOptions.byName.get("salvageOptionOne").addResult(componentTwo.id, 1);

        componentOne.setSalvageOption({
            name: "salvageOptionTwo",
            results: {
                [ componentTwo.id ]: 1
            },
            catalysts: {}
        });

        // Save the first component

        const updatedComponent = await underTest.components.save(componentOne);

        expect(updatedComponent.hasEssences).toEqual(true);
        expect(updatedComponent.isSalvageable).toEqual(true);
        expect(updatedComponent.salvageOptions.byName.size).toEqual(2);
        expect(updatedComponent.salvageOptions.byName.get("salvageOptionOne").catalysts.size).toEqual(1);
        expect(updatedComponent.salvageOptions.byName.get("salvageOptionOne").catalysts.amountFor(componentThree.id)).toEqual(1);
        expect(updatedComponent.salvageOptions.byName.get("salvageOptionOne").results.size).toEqual(2);
        expect(updatedComponent.salvageOptions.byName.get("salvageOptionOne").results.amountFor(componentTwo.id)).toEqual(2);

        // Create the first recipe

        const recipeOne = await underTest.recipes.create({
            itemUuid: testItemFourId,
            craftingSystemId: craftingSystem.id
        });

        expect(recipeOne).not.toBeUndefined();
        expect(recipeOne.itemUuid).toEqual(testItemFourId);
        expect(recipeOne.craftingSystemId).toEqual(craftingSystem.id);
        expect(recipeOne.hasResults).toEqual(false);
        expect(recipeOne.hasRequirements).toEqual(false);

        await recipeOne.load();

        expect(recipeOne.name).toEqual(testItemFourName);
        expect(recipeOne.imageUrl).toEqual(testItemFourImageUrl);

        // Add a requirement to the recipe

        recipeOne.setRequirementOption({
            name: "requirementOptionOne",
            ingredients: {
                [ componentOne.id ]: 1
            },
            catalysts: {
                [ componentTwo.id ]: 1
            }
        });

        recipeOne.requirementOptions.byName.get("requirementOptionOne").addIngredient(componentOne.id, 1);

        recipeOne.setResultOption({
            name: "resultOptionOne",
            results: {
                [ componentThree.id ]: 2
            }
        });

        recipeOne.resultOptions.byName.get("resultOptionOne").subtract(componentThree.id, 1);

        // Save the recipe

        const updatedRecipeOne = await underTest.recipes.save(recipeOne);

        expect(updatedRecipeOne.hasResults).toEqual(true);
        expect(updatedRecipeOne.hasRequirements).toEqual(true);
        expect(updatedRecipeOne.requirementOptions.size).toEqual(1);
        const recipeOneRequirementOptionOne = updatedRecipeOne.requirementOptions.byName.get("requirementOptionOne");
        expect(recipeOneRequirementOptionOne.ingredients.size).toEqual(2);
        expect(recipeOneRequirementOptionOne.ingredients.amountFor(componentOne.id)).toEqual(2);
        expect(recipeOneRequirementOptionOne.catalysts.size).toEqual(1);
        expect(recipeOneRequirementOptionOne.catalysts.amountFor(componentTwo.id)).toEqual(1);
        expect(updatedRecipeOne.resultOptions.size).toEqual(1);
        const recipeOneResultOptionOne = updatedRecipeOne.resultOptions.byName.get("resultOptionOne");
        expect(recipeOneResultOptionOne.results.size).toEqual(1);
        expect(recipeOneResultOptionOne.results.amountFor(componentThree.id)).toEqual(1);

        // Create the second recipe

        const recipeTwo = await underTest.recipes.create({
            itemUuid: testItemFiveId,
            craftingSystemId: craftingSystem.id
        });

        expect(recipeTwo).not.toBeUndefined();

        recipeTwo.addEssence(essenceOne.id, 1);
        recipeTwo.addEssence(essenceTwo.id, 2);

        recipeTwo.setResultOption({
            name: "resultOptionOne",
            results: {
                [ componentOne.id ]: 1
            }
        });

        const updatedRecipeTwo = await underTest.recipes.save(recipeTwo);

        expect(updatedRecipeTwo.hasResults).toEqual(true);
        expect(updatedRecipeTwo.hasRequirements).toEqual(false);
        expect(updatedRecipeTwo.resultOptions.size).toEqual(1);
        const recipeTwoResultOptionOne = updatedRecipeTwo.resultOptions.byName.get("resultOptionOne");
        expect(recipeTwoResultOptionOne.results.size).toEqual(1);
        expect(recipeTwoResultOptionOne.results.amountFor(componentOne.id)).toEqual(1);
        expect(updatedRecipeTwo.requiresEssences).toEqual(true);
        expect(updatedRecipeTwo.essences.size).toEqual(3);
        expect(updatedRecipeTwo.essences.amountFor(essenceOne.id)).toEqual(1);
        expect(updatedRecipeTwo.essences.amountFor(essenceTwo.id)).toEqual(2);

    });

});