import {describe, expect, test} from "@jest/globals";
import {StubDocumentManager} from "./stubs/StubDocumentManager";
import {StubGameProvider} from "./stubs/foundry/StubGameProvider";
import {GameProvider} from "../src/scripts/foundry/GameProvider";
import {StubClientSettingsFactory} from "./stubs/foundry/StubClientSettings";
import Properties from "../src/scripts/Properties";
import {StubIdentityFactory} from "./stubs/foundry/StubIdentityFactory";
import {StubUIProvider} from "./stubs/foundry/StubUIProvider";
import {FabricateItemData, LoadedFabricateItemData} from "../src/scripts/foundry/DocumentManager";
import {DefaultFabricateAPIFactory} from "../src/scripts/api/FabricateAPIFactory";
import {SettingVersion} from "../src/scripts/repository/migration/SettingVersion";
import {SettingMigrationStatus} from "../src/scripts/repository/migration/SettingMigrationStatus";
import {
    buildV2SettingsValue,
    buildDefaultV3SettingsValue,
    buildAlchemistsSuppliesOnlyV3SettingsValue
} from "./test_data/TestSettingMigrationData";
import {FabricateStatistics} from "../src/scripts/api/FabricateAPI";
import {
    AlchemistsSuppliesV16SystemDefinition
} from "../src/scripts/repository/embedded_systems/AlchemistsSuppliesV16SystemDefinition";
import {EssenceReference} from "../src/scripts/crafting/essence/EssenceReference";
import {ComponentReference} from "../src/scripts/crafting/component/ComponentReference";
import {DefaultCombination} from "../src/scripts/common/Combination";
describe("Crafting System integration", () => {

    test("Create Crafting System from scratch", async () => {

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
        const defaultSettingsValue = buildDefaultV3SettingsValue();
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
        const craftingSystem = await underTest.systems.create(craftingSystemOptions);

        expect(craftingSystem).not.toBeUndefined();
        expect(craftingSystem.details.name).toEqual(craftingSystemOptions.name);
        expect(craftingSystem.details.summary).toEqual(craftingSystemOptions.summary);
        expect(craftingSystem.details.description).toEqual(craftingSystemOptions.description);
        expect(craftingSystem.details.author).toEqual(user);

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

        componentOne.salvageOptions.all.find(option => option.name === "salvageOptionOne").value.addProduct(componentTwo.id, 1);

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
        expect(updatedComponent.salvageOptions.all.length).toEqual(2);
        const updatedSalvageOption = updatedComponent.salvageOptions.all.find(option => option.name === "salvageOptionOne");
        expect(updatedSalvageOption.value.catalysts.size).toEqual(1);
        expect(updatedSalvageOption.value.catalysts.amountFor(componentThree.id)).toEqual(1);
        expect(updatedSalvageOption.value.products.size).toEqual(2);
        expect(updatedSalvageOption.value.products.amountFor(componentTwo.id)).toEqual(2);

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
            essences: {},
            ingredients: {
                [ componentOne.id ]: 1
            },
            catalysts: {
                [ componentTwo.id ]: 1
            }
        });

        recipeOne.requirementOptions.all.find(option => option.name === "requirementOptionOne").value.addIngredient(componentOne.id, 1);

        recipeOne.setResultOption({
            name: "resultOptionOne",
            results: {
                [ componentThree.id ]: 2
            }
        });

        recipeOne.resultOptions.all.find(option => option.name === "resultOptionOne").value.subtract(componentThree.id, 1);

        // Save the recipe

        const updatedRecipeOne = await underTest.recipes.save(recipeOne);

        expect(updatedRecipeOne.hasResults).toEqual(true);
        expect(updatedRecipeOne.hasRequirements).toEqual(true);
        expect(updatedRecipeOne.requirementOptions.size).toEqual(1);
        const recipeOneRequirementOptionOne = updatedRecipeOne.requirementOptions.all.find(option => option.name === "requirementOptionOne");
        expect(recipeOneRequirementOptionOne.value.ingredients.size).toEqual(2);
        expect(recipeOneRequirementOptionOne.value.ingredients.amountFor(componentOne.id)).toEqual(2);
        expect(recipeOneRequirementOptionOne.value.catalysts.size).toEqual(1);
        expect(recipeOneRequirementOptionOne.value.catalysts.amountFor(componentTwo.id)).toEqual(1);
        expect(updatedRecipeOne.resultOptions.size).toEqual(1);
        const recipeOneResultOptionOne = updatedRecipeOne.resultOptions.all.find(option => option.name === "resultOptionOne");
        expect(recipeOneResultOptionOne.value.products.size).toEqual(1);
        expect(recipeOneResultOptionOne.value.products.amountFor(componentThree.id)).toEqual(1);

        // Create the second recipe

        const recipeTwo = await underTest.recipes.create({
            itemUuid: testItemFiveId,
            craftingSystemId: craftingSystem.id
        });

        expect(recipeTwo).not.toBeUndefined();

        recipeTwo.setRequirementOption({
            name: "requirementOptionOne",
            essences: {
                [ essenceOne.id ]: 1
            }
        });

        recipeTwo.requirementOptions.all.find(option => option.name === "requirementOptionOne").value.addEssence(essenceTwo.id, 2);

        recipeTwo.setResultOption({
            name: "resultOptionOne",
            results: {
                [ componentOne.id ]: 1
            }
        });

        const updatedRecipeTwo = await underTest.recipes.save(recipeTwo);

        expect(updatedRecipeTwo.hasResults).toEqual(true);
        expect(updatedRecipeTwo.hasRequirements).toEqual(true);
        expect(updatedRecipeTwo.resultOptions.size).toEqual(1);
        const recipeTwoResultOptionOne = updatedRecipeTwo.resultOptions.all.find(option => option.name === "resultOptionOne");
        expect(recipeTwoResultOptionOne.value.products.size).toEqual(1);
        expect(recipeTwoResultOptionOne.value.products.amountFor(componentOne.id)).toEqual(1);

    });

});

describe("Data migration", () => {

    test("should use 'V2' when no global setting version is set", async () => {

        const documentManager = new StubDocumentManager();
        const gameProvider: GameProvider = new StubGameProvider();
        const uiProvider = new StubUIProvider();
        const defaultSettingsValue = buildV2SettingsValue();
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

        const underTest = fabricateAPIFactory.make();

        const result = await underTest.migration.getCurrentVersion();

        expect(result).toBe(SettingVersion.V2);

    });

    test("should use 'V3' when global setting version is set to 'V3'", async () => {

        const documentManager = new StubDocumentManager();
        const gameProvider: GameProvider = new StubGameProvider();
        const uiProvider = new StubUIProvider();
        const defaultSettingsValue = buildDefaultV3SettingsValue();
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

        const underTest = fabricateAPIFactory.make();

        const result = await underTest.migration.getCurrentVersion();

        expect(result).toBe(SettingVersion.V3);

    });

    test("should not migrate when target version and current version match", async () => {

        const documentManager = new StubDocumentManager();
        const gameProvider: GameProvider = new StubGameProvider();
        const uiProvider = new StubUIProvider();
        const defaultSettingsValue = buildDefaultV3SettingsValue();
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

        const underTest = fabricateAPIFactory.make();

        const migrationNeeded = await underTest.migration.isMigrationNeeded();

        expect(migrationNeeded).toBe(false);

        const result = await underTest.migration.migrateAll();

        expect(result.status).toBe(SettingMigrationStatus.NOT_NEEDED);
        expect(result.from).toBe(SettingVersion.V3);
        expect(result.to).toBe(SettingVersion.V3);

    });

    test("should migrate from V2 to V3", async () => {

        const documentManager = new StubDocumentManager();
        const gameProvider: GameProvider = new StubGameProvider();
        const uiProvider = new StubUIProvider();
        const defaultSettingsValue = buildV2SettingsValue();
        const clientSettings: ClientSettings = new StubClientSettingsFactory().make(defaultSettingsValue);
        const identityFactory = new StubIdentityFactory();

        const craftingSystemsBefore = defaultSettingsValue.get(Properties.module.id).get(Properties.settings.craftingSystems.key).value;
        const craftingSystemIds = Object.keys(craftingSystemsBefore);
        const fabricateStatisticsBefore = craftingSystemIds
            .map(craftingSystemId => {
                const craftingSystem = craftingSystemsBefore[craftingSystemId];
                const essences = craftingSystem.parts.essences;
                const components = craftingSystem.parts.components;
                const recipes = craftingSystem.parts.recipes;
                return {
                    craftingSystemId,
                    essences,
                    components,
                    recipes
                }
            })
            .reduce((statistics, system) => {
                statistics.craftingSystems.count++;
                statistics.craftingSystems.ids.push(system.craftingSystemId);
                statistics.essences.count += Object.keys(system.essences).length;
                statistics.essences.ids.push(...Object.keys(system.essences));
                statistics.components.count += Object.keys(system.components).length;
                statistics.components.ids.push(...Object.keys(system.components));
                statistics.recipes.count += Object.keys(system.recipes).length;
                statistics.recipes.ids.push(...Object.keys(system.recipes));
                return statistics;
            }, <FabricateStatistics>{
                craftingSystems: { count: 0, ids: [] },
                essences: { count: 0, ids: [], byCraftingSystem: {} },
                components: { count: 0, ids: [], byCraftingSystem: {} },
                recipes: { count: 0, ids: [], byCraftingSystem: {} }
            });

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

        const underTest = fabricateAPIFactory.make();

        const result = await underTest.migration.migrateAll();

        expect(result.status).toBe(SettingMigrationStatus.SUCCESS);
        expect(result.from).toBe(SettingVersion.V2);
        expect(result.to).toBe(SettingVersion.V3);

        const fabricateStatisticsAfter = await underTest.getStatistics();

        const alchemistsSuppliesV16SystemDefinition = new AlchemistsSuppliesV16SystemDefinition();
        const alchemistsSuppliesUpdatedComponentIds = alchemistsSuppliesV16SystemDefinition.components.map(component => component.id);
        const alchemistsSuppliesUpdatedRecipeIds = alchemistsSuppliesV16SystemDefinition.recipes.map(recipe => recipe.id);
        const otherSystemPartIds = Object.keys(craftingSystemsBefore)
            .filter(craftingSystemId => craftingSystemId !== alchemistsSuppliesV16SystemDefinition.craftingSystem.id)
            .map(craftingSystemId => craftingSystemsBefore[craftingSystemId])
            .map(craftingSystem => {
                const componentIds = Object.keys(craftingSystem.parts.components);
                const recipeIds = Object.keys(craftingSystem.parts.recipes);
                return {
                    componentIds,
                    recipeIds
                }
            })
            .reduce((allIds, systemIds) => {
                allIds.componentIds.push(...systemIds.componentIds);
                allIds.recipeIds.push(...systemIds.recipeIds);
                return allIds;
            }, { recipeIds: [], componentIds: [] });

        const expectedComponentIds = [
            ...alchemistsSuppliesUpdatedComponentIds,
            ...otherSystemPartIds.componentIds
        ];
        const expectedRecipeIds = [
            ...alchemistsSuppliesUpdatedRecipeIds,
            ...otherSystemPartIds.recipeIds
        ];

        expect(fabricateStatisticsAfter.craftingSystems.count).toBe(fabricateStatisticsBefore.craftingSystems.count);
        expect(fabricateStatisticsAfter.craftingSystems.ids).toEqual(fabricateStatisticsBefore.craftingSystems.ids);
        expect(fabricateStatisticsAfter.essences.count).toEqual(fabricateStatisticsBefore.essences.count);
        expect(fabricateStatisticsAfter.essences.ids).toEqual(expect.arrayContaining(fabricateStatisticsBefore.essences.ids));
        expect(fabricateStatisticsAfter.components.count).toEqual(fabricateStatisticsBefore.components.count);
        expect(fabricateStatisticsAfter.components.ids).toEqual(expect.arrayContaining(expectedComponentIds));
        expect(fabricateStatisticsAfter.recipes.count).toEqual(fabricateStatisticsBefore.recipes.count);
        expect(fabricateStatisticsAfter.recipes.ids).toEqual(expect.arrayContaining(expectedRecipeIds));

    });

});

describe("Export and import data", () => {

    test("Import V1 export data", async () => {});

    test("Import V2 export data", async () => {});

    test("Export Crafting System to V2 export data", async () => {

        // Build the API factory's dependencies

        const gameProvider: GameProvider = new StubGameProvider();
        const uiProvider = new StubUIProvider();
        const documentManager = new StubDocumentManager({ allowUnknownIds: true });
        const defaultSettingsValue = buildAlchemistsSuppliesOnlyV3SettingsValue();
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

        const alchemistsSupplies = new AlchemistsSuppliesV16SystemDefinition();
        const exportData = await underTest.dataExchangeAPI.fabricate.export(alchemistsSupplies.craftingSystem.id);

        expect(exportData).not.toBeNull();
        expect(exportData.version).toBe("V2");

        expect(exportData.craftingSystem).not.toBeNull();
        expect(exportData.craftingSystem.id).toBe(alchemistsSupplies.craftingSystem.id);
        expect(exportData.craftingSystem.details.name).toBe(alchemistsSupplies.craftingSystem.details.name);
        expect(exportData.craftingSystem.details.description).toBe(alchemistsSupplies.craftingSystem.details.description);
        expect(exportData.craftingSystem.details.author).toBe(alchemistsSupplies.craftingSystem.details.author);
        expect(exportData.craftingSystem.details.summary).toBe(alchemistsSupplies.craftingSystem.details.summary);

        expect(exportData.essences).not.toBeNull();
        expect(exportData.essences.length).toBe(alchemistsSupplies.essences.length);
        alchemistsSupplies.essences.forEach(essence => {
            const exportedEssence = exportData.essences.find(exportedEssence => exportedEssence.id === essence.id);
            expect(exportedEssence).not.toBeNull();
            expect(exportedEssence.id).toEqual(essence.id);
            expect(exportedEssence.craftingSystemId).toEqual(essence.craftingSystemId);
            expect(exportedEssence.name).toEqual(essence.name);
            expect(exportedEssence.description).toEqual(essence.description);
            expect(exportedEssence.tooltip).toEqual(essence.tooltip);
            expect(exportedEssence.iconCode).toEqual(essence.iconCode);
            expect(exportedEssence.disabled).toEqual(essence.disabled);
        });

        expect(exportData.components).not.toBeNull();
        expect(exportData.components.length).toEqual(alchemistsSupplies.components.length);
        alchemistsSupplies.components.forEach(component => {
            const exportedComponent = exportData.components.find(exportedComponent => exportedComponent.id === component.id);
            expect(exportedComponent).not.toBeNull();
            expect(exportedComponent.id).toEqual(component.id);
            expect(exportedComponent.craftingSystemId).toEqual(component.craftingSystemId);
            expect(exportedComponent.itemUuid).toEqual(component.itemUuid);
            expect(exportedComponent.disabled).toEqual(component.isDisabled);

            const exportedComponentEssences = DefaultCombination.fromRecord(exportedComponent.essences, id => new EssenceReference(id));
            expect(exportedComponentEssences.equals(component.essences)).toBe(true);

            expect(exportedComponent.salvageOptions.length).toEqual(component.salvageOptions.size);
            exportedComponent.salvageOptions.forEach(exportedSalvageOption => {
                const componentSalvageOption = component.salvageOptions.all.find(componentSalvageOption => componentSalvageOption.id === exportedSalvageOption.id);
                expect(componentSalvageOption).not.toBeNull();
                expect(exportedSalvageOption.id).toEqual(componentSalvageOption.id);
                expect(exportedSalvageOption.name).toEqual(componentSalvageOption.name);
                const exportedSalvageOptionCatalysts = DefaultCombination.fromRecord(exportedSalvageOption.catalysts, id => new ComponentReference(id));
                expect(exportedSalvageOptionCatalysts.equals(componentSalvageOption.value.catalysts)).toBe(true);
                const exportedSalvageOptionResults = DefaultCombination.fromRecord(exportedSalvageOption.results, id => new ComponentReference(id));
                expect(exportedSalvageOptionResults.equals(componentSalvageOption.value.products)).toBe(true);
            });
        });

        expect(exportData.recipes).not.toBeNull();
        expect(exportData.recipes.length).toEqual(alchemistsSupplies.recipes.length);
        alchemistsSupplies.recipes.forEach(recipe => {
            const exportedRecipe = exportData.recipes.find(exportedRecipe => exportedRecipe.id === recipe.id);
            expect(exportedRecipe).not.toBeNull();
            expect(exportedRecipe.id).toEqual(recipe.id);
            expect(exportedRecipe.craftingSystemId).toEqual(recipe.craftingSystemId);
            expect(exportedRecipe.itemUuid).toEqual(recipe.itemUuid);
            expect(exportedRecipe.disabled).toEqual(recipe.isDisabled);

            expect(exportedRecipe.resultOptions.length).toEqual(recipe.resultOptions.size);
            exportedRecipe.resultOptions.forEach(exportedResultOption => {
                const recipeResultOption = recipe.resultOptions.byId.get(exportedResultOption.id);
                expect(recipeResultOption).not.toBeNull();
                expect(exportedResultOption.id).toEqual(recipeResultOption.id);
                expect(exportedResultOption.name).toEqual(recipeResultOption.name);
                const exportedResultOptionResults = DefaultCombination.fromRecord(exportedResultOption.results, id => new ComponentReference(id));
                expect(exportedResultOptionResults.equals(recipeResultOption.value.products)).toBe(true);
            });

            expect(exportedRecipe.requirementOptions.length).toEqual(recipe.requirementOptions.size);
            exportedRecipe.requirementOptions.forEach(exportedRequirementOption => {
                const recipeRequirementOption = recipe.requirementOptions.byId.get(exportedRequirementOption.id);
                expect(recipeRequirementOption).not.toBeNull();
                expect(exportedRequirementOption.id).toEqual(recipeRequirementOption.id);
                expect(exportedRequirementOption.name).toEqual(recipeRequirementOption.name);
                const exportedRequirementOptionCatalysts = DefaultCombination.fromRecord(exportedRequirementOption.catalysts, id => new ComponentReference(id));
                expect(exportedRequirementOptionCatalysts.equals(recipeRequirementOption.value.catalysts)).toBe(true);
                const exportedRequirementOptionIngredients = DefaultCombination.fromRecord(exportedRequirementOption.ingredients, id => new ComponentReference(id));
                expect(exportedRequirementOptionIngredients.equals(recipeRequirementOption.value.ingredients)).toBe(true);
                const exportedRequirementOptionEssences = DefaultCombination.fromRecord(exportedRequirementOption.essences, id => new EssenceReference(id));
                expect(exportedRequirementOptionEssences.equals(recipeRequirementOption.value.essences)).toBe(true);
            });
        });

    });

});