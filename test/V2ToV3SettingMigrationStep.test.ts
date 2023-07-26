import {describe, test, expect} from "@jest/globals";
import {V2ToV3SettingMigrationStep} from "../src/scripts/repository/migration/V2ToV3SettingMigrationStep";
import {StubIdentityFactory} from "./stubs/foundry/StubIdentityFactory";
import {SettingManager} from "../src/scripts/repository/SettingManager";
import Properties from "../src/scripts/Properties";
import {StubSettingManager} from "./stubs/foundry/StubSettingManager";
import {
    getAlchemistsSuppliesV16InitialSettingValue,
    getBlacksmithingInitialSettingValue
} from "./test_data/TestSettingMigrationData";

const alchmistsSupliesSystemId = "alchemists-supplies-v1.6";
const blacksmithingSystemId = "PeZF10C7FMN4dhfa";
const alchemistsSuppliesV16InitialSettingValue: any = getAlchemistsSuppliesV16InitialSettingValue();
const blacksmithingInitialSettingValue: any = getBlacksmithingInitialSettingValue();
const v2CraftingSystemSettingsValue = {
    version: "2",
    value: {
        [alchmistsSupliesSystemId]: alchemistsSuppliesV16InitialSettingValue,
        [blacksmithingSystemId]: blacksmithingInitialSettingValue
    }
};

describe("V2 to V3 Settings Migration Step", () => {

    test("Should migrate crafting systems correctly", async () => {

        const identityFactory = new StubIdentityFactory();
        const craftingSystemSettingManager = new StubSettingManager(v2CraftingSystemSettingsValue);

        const settingManagersBySettingPath = new Map<string, SettingManager<any>>([
            [ Properties.settings.craftingSystems.key, craftingSystemSettingManager ],
            [ Properties.settings.essences.key, new StubSettingManager() ],
            [ Properties.settings.components.key, new StubSettingManager() ],
            [ Properties.settings.recipes.key, new StubSettingManager() ],
            [ Properties.settings.modelVersion.key, new StubSettingManager() ],
        ]);

        const underTest = new V2ToV3SettingMigrationStep({
            identityFactory,
            embeddedCraftingSystemsIds: [alchmistsSupliesSystemId],
            settingManagersBySettingPath,
        });

        await underTest.perform();

        const migratedCraftingSystemsSettings: any = await craftingSystemSettingManager.read();

        expect(migratedCraftingSystemsSettings).not.toBeNull();
        expect(migratedCraftingSystemsSettings.collections).toEqual({});
        const migratedCraftingSystemIds = Object.keys(migratedCraftingSystemsSettings.entities);
        expect(migratedCraftingSystemIds.length).toEqual(1);
        expect(migratedCraftingSystemIds).toEqual(expect.arrayContaining([blacksmithingSystemId]));

        const migratedBlacksmithingSystem = migratedCraftingSystemsSettings.entities[blacksmithingSystemId];
        expect(migratedBlacksmithingSystem.details.name).toEqual(blacksmithingInitialSettingValue.details.name);
        expect(migratedBlacksmithingSystem.details.description).toEqual(blacksmithingInitialSettingValue.details.description);
        expect(migratedBlacksmithingSystem.details.author).toEqual(blacksmithingInitialSettingValue.details.author);
        expect(migratedBlacksmithingSystem.details.summary).toEqual(blacksmithingInitialSettingValue.details.summary);
        expect(migratedBlacksmithingSystem.embedded).toBe(false);
        expect(migratedBlacksmithingSystem.enabled).toBe(blacksmithingInitialSettingValue.enabled);

    });

    test("Should migrate recipes correctly", async () => {

        const identityFactory = new StubIdentityFactory();
        const craftingSystemSettingManager = new StubSettingManager(v2CraftingSystemSettingsValue);
        const recipeSettingsManager = new StubSettingManager();

        const settingManagersBySettingPath = new Map<string, SettingManager<any>>([
            [ Properties.settings.craftingSystems.key, craftingSystemSettingManager ],
            [ Properties.settings.essences.key, new StubSettingManager() ],
            [ Properties.settings.components.key, new StubSettingManager() ],
            [ Properties.settings.recipes.key, recipeSettingsManager ],
            [ Properties.settings.modelVersion.key, new StubSettingManager() ],
        ]);

        const underTest = new V2ToV3SettingMigrationStep({
            identityFactory,
            embeddedCraftingSystemsIds: [alchmistsSupliesSystemId],
            settingManagersBySettingPath,
        });

        await underTest.perform();

        const migratedRecipeSettings: any = await recipeSettingsManager.read();

        expect(migratedRecipeSettings).not.toBeNull();
        const blacksmithingRecipeIds = Object.keys(blacksmithingInitialSettingValue.parts.recipes);
        // recipes should have collection references for their crafting system and the item
        expect(migratedRecipeSettings.collections[`${Properties.settings.collectionNames.craftingSystem}.${blacksmithingSystemId}`]).toEqual(expect.arrayContaining(blacksmithingRecipeIds));
        blacksmithingRecipeIds.forEach(recipeId => {
            const originalRecipe = blacksmithingInitialSettingValue.parts.recipes[recipeId];
            expect(migratedRecipeSettings.collections[`${Properties.settings.collectionNames.item}.${originalRecipe.itemUuid}`]).toEqual(expect.arrayContaining([recipeId]));
        });

        blacksmithingRecipeIds.forEach(recipeId => {
            const migratedRecipe = migratedRecipeSettings.entities[recipeId];
            const originalRecipe = blacksmithingInitialSettingValue.parts.recipes[recipeId];
            expect(migratedRecipe.id).toEqual(recipeId);
            // itemUuid is migrated as-is
            expect(migratedRecipe.itemUuid).toEqual(originalRecipe.itemUuid);
            // disabled and embedded are new fields,which default to false for user-defined crafting systems
            expect(migratedRecipe.disabled).toEqual(false);
            expect(migratedRecipe.embedded).toEqual(false);
            // craftingSystemId is now included in the recipe
            expect(migratedRecipe.craftingSystemId).toEqual(blacksmithingSystemId);

            // compare the recipe's requirement options (formerly ingredient options)
            const ingredientOptionNames = Object.keys(originalRecipe.ingredientOptions);
            const hadRequirements = ingredientOptionNames.length > 0;
            const essenceNames = Object.keys(originalRecipe.essences);
            const hadEssences = essenceNames.length > 0;
            // if the recipe had requirements or essences, the migrated recipe should have requirement options
            // essences are migrated as requirement options,either added to all existing or added as a new option
            if (hadRequirements || hadEssences) {
                ingredientOptionNames.forEach(ingredientOptionName => {
                    // options should have generated IDs in addition to names
                    // they should take different values, so we have to search for the option by name
                    const originalIngredientOption = originalRecipe.ingredientOptions[ingredientOptionName];
                    const migratedRequirementOption: any = Object.values(migratedRecipe.requirementOptions)
                        .find((migratedRequirementOption: any) => migratedRequirementOption.name === ingredientOptionName);
                    expect(migratedRequirementOption).not.toBeNull();
                    // test the migrated option settings
                    expect(migratedRequirementOption.catalysts).toMatchObject(originalIngredientOption.catalysts);
                    expect(migratedRequirementOption.ingredients).toMatchObject(originalIngredientOption.ingredients);
                    expect(migratedRequirementOption.essences).toMatchObject(originalRecipe.essences);
                    expect(migratedRequirementOption.name).toEqual(ingredientOptionName);
                    expect(typeof migratedRequirementOption.id).toEqual("string");
                    expect(migratedRequirementOption.id.length).toBeGreaterThan(0);
                    expect(migratedRequirementOption.id).not.toEqual(ingredientOptionName);
                });
            } else {
                expect(migratedRecipe.requirementOptions).toEqual({});
            }

            // compare the recipe's result options
            const resultOptionNames = Object.keys(originalRecipe.resultOptions);
            const hadResults = resultOptionNames.length > 0;
            if (hadResults) {
                resultOptionNames.forEach(resultOptionName => {
                    // options should have generated IDs in addition to names
                    // they should take different values, so we have to search for the option by name
                    const originalResultOption = originalRecipe.resultOptions[resultOptionName];
                    const migratedResultOption: any = Object.values(migratedRecipe.resultOptions)
                        .find((migratedResultOption: any) => migratedResultOption.name === resultOptionName);
                    expect(migratedResultOption).not.toBeNull();
                    // test the migrated option settings
                    // result options now contain a results property, to which the original result option is migrated
                    expect(migratedResultOption.results).toMatchObject(originalResultOption);
                    expect(migratedResultOption.name).toEqual(resultOptionName);
                    expect(typeof migratedResultOption.id).toEqual("string");
                    expect(migratedResultOption.id.length).toBeGreaterThan(0);
                    expect(migratedResultOption.id).not.toEqual(resultOptionName);
                });
            } else {
                expect(migratedRecipe.resultOptions).toEqual({});
            }

        });


    });

    test("Should migrate components correctly", async () => {

        const identityFactory = new StubIdentityFactory();
        const craftingSystemSettingManager = new StubSettingManager(v2CraftingSystemSettingsValue);

        const componentsSettingManager = new StubSettingManager();
        const settingManagersBySettingPath = new Map<string, SettingManager<any>>([
            [ Properties.settings.craftingSystems.key, craftingSystemSettingManager ],
            [ Properties.settings.essences.key, new StubSettingManager() ],
            [ Properties.settings.components.key, componentsSettingManager ],
            [ Properties.settings.recipes.key, new StubSettingManager() ],
            [ Properties.settings.modelVersion.key, new StubSettingManager() ],
        ]);

        const underTest = new V2ToV3SettingMigrationStep({
            identityFactory,
            embeddedCraftingSystemsIds: [alchmistsSupliesSystemId],
            settingManagersBySettingPath,
        });

        await underTest.perform();

        const migratedComponentSettings: any = await componentsSettingManager.read();

        expect(migratedComponentSettings).not.toBeNull();
        const blacksmithingComponentIds = Object.keys(blacksmithingInitialSettingValue.parts.components);
        // components should have collection sentries for the crafting system and the item
        expect(migratedComponentSettings.collections[`${Properties.settings.collectionNames.craftingSystem}.${blacksmithingSystemId}`]).toEqual(expect.arrayContaining(blacksmithingComponentIds));
        blacksmithingComponentIds.forEach(componentId => {
            const originalComponent = blacksmithingInitialSettingValue.parts.components[componentId];
            expect(migratedComponentSettings.collections[`${Properties.settings.collectionNames.item}.${originalComponent.itemUuid}`]).toEqual(expect.arrayContaining([componentId]));
        });

        blacksmithingComponentIds.forEach(componentId => {
            const migratedComponent = migratedComponentSettings.entities[componentId];
            const originalComponent = blacksmithingInitialSettingValue.parts.components[componentId];
            expect(migratedComponent.id).toEqual(componentId);
            // itemUuid is migrated as-is
            expect(migratedComponent.itemUuid).toEqual(originalComponent.itemUuid);
            expect(migratedComponent.disabled).toEqual(migratedComponent.disabled);
            // embedded is a new field, which defaults to false for user-defined crafting systems
            expect(migratedComponent.embedded).toEqual(false);
            // craftingSystemId is now included in the component
            expect(migratedComponent.craftingSystemId).toEqual(blacksmithingSystemId);
            expect(migratedComponent.essences).toMatchObject(originalComponent.essences);

            // compare the component's salvage options
            const salvageOptionNames = Object.keys(originalComponent.salvageOptions);
            const hadSalvage = salvageOptionNames.length > 0;
            if (hadSalvage) {
                // options should have generated IDs in addition to names
                // they should take different values, so we have to search for the option by name
                salvageOptionNames.forEach(salvageOptionName => {
                    const originalSalvageOption = originalComponent.salvageOptions[salvageOptionName];
                    const migratedSalvageOption: any = Object.values(migratedComponent.salvageOptions)
                        .find((migratedSalvageOption: any) => migratedSalvageOption.name === salvageOptionName);
                    expect(migratedSalvageOption).not.toBeNull();
                    // test the migrated option settings
                    expect(migratedSalvageOption.results).toMatchObject(originalSalvageOption);
                    // catalysts is a new property that defaults to an empty object
                    expect(migratedSalvageOption.catalysts).toMatchObject({});
                    expect(migratedSalvageOption.name).toEqual(salvageOptionName);
                    expect(typeof migratedSalvageOption.id).toEqual("string");
                    expect(migratedSalvageOption.id.length).toBeGreaterThan(0);
                    expect(migratedSalvageOption.id).not.toEqual(salvageOptionName);
                });
            } else {
                expect(migratedComponent.salvageOptions).toEqual({});
            }
        });

    });

    test("Should migrate essences correctly", async () => {

        const identityFactory = new StubIdentityFactory();
        const craftingSystemSettingManager = new StubSettingManager(v2CraftingSystemSettingsValue);

        const essenceSettingManager = new StubSettingManager();
        const settingManagersBySettingPath = new Map<string, SettingManager<any>>([
            [ Properties.settings.craftingSystems.key, craftingSystemSettingManager ],
            [ Properties.settings.essences.key, essenceSettingManager ],
            [ Properties.settings.components.key, new StubSettingManager() ],
            [ Properties.settings.recipes.key, new StubSettingManager() ],
            [ Properties.settings.modelVersion.key, new StubSettingManager() ],
        ]);

        const underTest = new V2ToV3SettingMigrationStep({
            identityFactory,
            embeddedCraftingSystemsIds: [alchmistsSupliesSystemId],
            settingManagersBySettingPath,
        });

        await underTest.perform();

        const migratedEssenceSettings: any = await essenceSettingManager.read();

        expect(migratedEssenceSettings).not.toBeNull();
        const blacksmithingEssenceIds = Object.keys(blacksmithingInitialSettingValue.parts.essences);
        // essences should have collection entries for the crafting system and the item *if* they have an active effect source
        expect(migratedEssenceSettings.collections[`${Properties.settings.collectionNames.craftingSystem}.${blacksmithingSystemId}`]).toEqual(expect.arrayContaining(blacksmithingEssenceIds));
        blacksmithingEssenceIds
            .map(essenceId => {
                return {
                    id: essenceId,
                    value: blacksmithingInitialSettingValue.parts.essences[essenceId],
                }
            })
            .filter(essence => essence.value.activeEffectSourceItemUuid)
            .forEach(essence => {
                const originalEssence = essence.value;
                expect(migratedEssenceSettings.collections[`${Properties.settings.collectionNames.item}.${originalEssence.activeEffectSourceItemUuid}`]).toEqual(expect.arrayContaining([essence.id]));
            });

        blacksmithingEssenceIds.forEach(essenceId => {
            const migratedEssence = migratedEssenceSettings.entities[essenceId];
            const originalEssence = blacksmithingInitialSettingValue.parts.essences[essenceId];
            expect(migratedEssence.id).toEqual(essenceId);
            expect(migratedEssence.name).toEqual(originalEssence.name);
            expect(migratedEssence.tooltip).toEqual(originalEssence.tooltip);
            expect(migratedEssence.activeEffectSourceItemUuid).toEqual(originalEssence.activeEffectSourceItemUuid);
            expect(migratedEssence.iconCode).toEqual(originalEssence.iconCode);
            expect(migratedEssence.description).toEqual(originalEssence.description);
            // disabled and embedded are new fields, which default to false for user-defined crafting systems
            expect(migratedEssence.disabled).toEqual(false);
            expect(migratedEssence.embedded).toEqual(false);
            // craftingSystemId is now included in the essence
            expect(migratedEssence.craftingSystemId).toEqual(blacksmithingSystemId);
        });


    });

});