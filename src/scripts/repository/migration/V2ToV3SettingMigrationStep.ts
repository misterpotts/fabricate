import {SettingVersion} from "./SettingVersion";
import {IdentityFactory} from "../../foundry/IdentityFactory";
import {SettingManager} from "../SettingManager";
import Properties from "../../Properties";
import {V3SettingsModel} from "./V3SettingsModel";
import {V2Component, V2CraftingSystem, V2Essence, V2Recipe, V2SettingsModel} from "./V2SettingsModel";
import {EssenceJson} from "../../crafting/essence/Essence";
import {CraftingSystemJson} from "../../system/CraftingSystem";
import {ComponentJson} from "../../crafting/component/Component";
import {SalvageJson} from "../../crafting/component/Salvage";
import {RecipeJson} from "../../crafting/recipe/Recipe";
import {ResultJson} from "../../crafting/recipe/Result";
import {RequirementJson} from "../../crafting/recipe/Requirement";
import {SettingMigrationStep} from "./SettingMigrationStep";

/**
 * This migration step is responsible for migrating the V2 settings model to the V3 settings model. It filters out
 * embedded crafting systems, as these should be overwritten separately during the migration process.
 */
class V2ToV3SettingMigrationStep implements SettingMigrationStep {

    private static readonly FROM_VERSION = SettingVersion.V2;
    private static readonly TO_VERSION = SettingVersion.V3;

    private readonly _identityFactory: IdentityFactory;
    private readonly _embeddedCraftingSystemIds: string[];
    private readonly _settingManagersBySettingPath: Map<string, SettingManager<any>>;

    constructor({
        identityFactory,
        embeddedCraftingSystemsIds,
        settingManagersBySettingPath,
    }: {
        identityFactory: IdentityFactory;
        embeddedCraftingSystemsIds: string[];
        settingManagersBySettingPath: Map<string, SettingManager<any>>;
    }) {
        this._identityFactory = identityFactory;
        this._embeddedCraftingSystemIds = embeddedCraftingSystemsIds;
        this._settingManagersBySettingPath = settingManagersBySettingPath;
    }

    get from(): SettingVersion {
        return V2ToV3SettingMigrationStep.FROM_VERSION;
    }

    get to(): SettingVersion {
        return V2ToV3SettingMigrationStep.TO_VERSION;
    }

    private _getSettingManagerByKey(key: string): SettingManager<any> {
        if (!this._settingManagersBySettingPath.has(key)) {
            throw new Error(`No setting manager found for setting path ${key}`);
        }
        return this._settingManagersBySettingPath.get(key);
    }

    private _getVersionSettingManager(): SettingManager<string> {
        return this._getSettingManagerByKey(Properties.settings.modelVersion.key);
    }

    async perform(): Promise<void> {

        const v3CraftingSystemSetting: V3SettingsModel["craftingSystems"] = {
            entities: {},
            collections: {}
        };

        const v3EssenceSetting: V3SettingsModel["essences"] = {
            entities: {},
            collections: {}
        };

        const v3ComponentSetting: V3SettingsModel["components"] = {
            entities: {},
            collections: {}
        };

        const v3RecipeSetting: V3SettingsModel["recipes"] = {
            entities: {},
            collections: {}
        };

        const craftingSystemsSettingManager = this._getSettingManagerByKey(Properties.settings.craftingSystems.key);
        const sourceData = await craftingSystemsSettingManager.read() as V2SettingsModel["craftingSystems"];

        const canMigrate = sourceData !== null && sourceData.hasOwnProperty("value");
        if (!canMigrate) {
            throw new Error("Cannot migrate V2 settings model to V3 settings model. V2 source data must be an object with a 'value' property.");
        }

        Object.keys(sourceData.value)
            .filter(craftingSystemId => !this._embeddedCraftingSystemIds.includes(craftingSystemId))
            .forEach(craftingSystemId => {
                const craftingSystem = sourceData.value[craftingSystemId];
                const migratedCraftingSystem = this.migrateCraftingSystem(craftingSystem, craftingSystemId);
                v3CraftingSystemSetting.entities[migratedCraftingSystem.id] = migratedCraftingSystem;

                const craftingSystemCollectionName = `${Properties.settings.collectionNames.craftingSystem}.${craftingSystemId}`;

                Object.keys(craftingSystem.parts.essences)
                    .map(essenceId => {
                        const essence = craftingSystem.parts.essences[essenceId];
                        return this.migrateEssence(essence, essenceId, craftingSystemId);
                    })
                    .forEach(migratedEssence => {
                        v3EssenceSetting.entities[migratedEssence.id] = migratedEssence;
                        this.pushSafelyToCollection(v3EssenceSetting.collections, craftingSystemCollectionName, migratedEssence.id);
                        if (migratedEssence.activeEffectSourceItemUuid) {
                            const itemCollectionName = `${Properties.settings.collectionNames.item}.${migratedEssence.activeEffectSourceItemUuid}`;
                            this.pushSafelyToCollection(v3EssenceSetting.collections, itemCollectionName, migratedEssence.id);
                        }
                    });

                Object.keys(craftingSystem.parts.components)
                    .map(componentId => {
                        const component = craftingSystem.parts.components[componentId];
                        return this.migrateComponent(component, componentId, craftingSystemId);
                    })
                    .forEach(migratedComponent => {
                        v3ComponentSetting.entities[migratedComponent.id] = migratedComponent;
                        this.pushSafelyToCollection(v3ComponentSetting.collections, craftingSystemCollectionName, migratedComponent.id);
                        const itemCollectionName = `${Properties.settings.collectionNames.item}.${migratedComponent.itemUuid}`;
                        this.pushSafelyToCollection(v3ComponentSetting.collections, itemCollectionName, migratedComponent.id);
                    });

                Object.keys(craftingSystem.parts.recipes)
                    .map(recipeId => {
                        const recipe = craftingSystem.parts.recipes[recipeId];
                        return this.migrateRecipe(recipe, recipeId, craftingSystemId);
                    })
                    .forEach(migratedRecipe => {
                        v3RecipeSetting.entities[migratedRecipe.id] = migratedRecipe;
                        this.pushSafelyToCollection(v3RecipeSetting.collections, craftingSystemCollectionName, migratedRecipe.id);
                        const itemCollectionName = `${Properties.settings.collectionNames.item}.${migratedRecipe.itemUuid}`;
                        this.pushSafelyToCollection(v3RecipeSetting.collections, itemCollectionName, migratedRecipe.id);
                    });
            });

        await craftingSystemsSettingManager.write(v3CraftingSystemSetting);

        const essenceSettingManager = this._getSettingManagerByKey(Properties.settings.essences.key);
        await essenceSettingManager.write(v3EssenceSetting);

        const componentSettingManager = this._getSettingManagerByKey(Properties.settings.components.key);
        await componentSettingManager.write(v3ComponentSetting);

        const recipeSettingManager = this._getSettingManagerByKey(Properties.settings.recipes.key);
        await recipeSettingManager.write(v3RecipeSetting);

        await this._getVersionSettingManager().write(V2ToV3SettingMigrationStep.TO_VERSION.toString());
    }

    private pushSafelyToCollection(collectionsObject: Record<string, string[]>, collectionName: string, value: any) {
        if (!collectionsObject[collectionName]) {
            collectionsObject[collectionName] = [];
        }
        collectionsObject[collectionName].push(value);
    }

    private migrateEssence(source: V2Essence, essenceId: string, craftingSystemId: string): EssenceJson {
        return {
            id: essenceId,
            disabled: false,
            name: source.name,
            tooltip: source.tooltip,
            iconCode: source.iconCode,
            description: source.description,
            craftingSystemId: craftingSystemId,
            embedded: false,
            activeEffectSourceItemUuid: source.activeEffectSourceItemUuid,
        };
    }

    private migrateCraftingSystem(source: V2CraftingSystem, craftingSystemId: string): CraftingSystemJson {
        return {
            id: craftingSystemId,
            details: {
                name: source.details.name,
                summary: source.details.summary,
                description: source.details.description,
                author: source.details.author
            },
            embedded: false,
            disabled: !!source.enabled
        };
    }

    private migrateComponent(source: V2Component, componentId: string, craftingSystemId: string): ComponentJson {
        const salvageOptions = Object.keys(source.salvageOptions)
            .map(salvageOptionId => {
                return {
                    id: this._identityFactory.make(),
                    name: salvageOptionId,
                    results: source.salvageOptions[salvageOptionId],
                    catalysts: {},
                }
            })
            .reduce((record, value) => {
                record[value.id] = value;
                return record;
            }, <Record<string, SalvageJson>>{});
        return {
            id: componentId,
            salvageOptions,
            embedded: false,
            craftingSystemId,
            disabled: source.disabled,
            itemUuid: source.itemUuid,
            essences: source.essences,
        };
    }

    private migrateRecipe(source: V2Recipe, recipeId: string, craftingSystemId: string): RecipeJson {
        const resultOptions = Object.keys(source.resultOptions)
            .map(resultOptionId => {
                return {
                    id: this._identityFactory.make(),
                    name: resultOptionId,
                    results: source.resultOptions[resultOptionId],
                    catalysts: {},
                }
            })
            .reduce((record, value) => {
                record[value.id] = value;
                return record;
            }, <Record<string, ResultJson>>{});
        const requirementOptions = Object.keys(source.ingredientOptions)
            .map(ingredientOptionId => {
                const ingredientOption = source.ingredientOptions[ingredientOptionId];
                return {
                    id: this._identityFactory.make(),
                    name: ingredientOptionId,
                    essences: source.essences,
                    ingredients: ingredientOption.ingredients,
                    catalysts: ingredientOption.catalysts,
                }
            })
            .reduce((record, value) => {
                record[value.id] = value;
                return record;
            }, <Record<string, RequirementJson>>{});
        if (Object.keys(source.essences).length > 0 && Object.keys(requirementOptions).length === 0) {
            const optionId = this._identityFactory.make();
            requirementOptions[optionId] = {
                id: optionId,
                name: "Essences only",
                essences: source.essences,
                ingredients: {},
                catalysts: {},
            }
        }
        return {
            id: recipeId,
            resultOptions,
            embedded: false,
            craftingSystemId,
            requirementOptions,
            disabled: false,
            itemUuid: source.itemUuid,
        };
    }

}

export {V2ToV3SettingMigrationStep};