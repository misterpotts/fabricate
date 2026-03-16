import {CraftingSystemData} from "./FabricateAPI";
import {FabricateExportModel} from "../repository/import/FabricateExportModel";
import {RecipeAPI} from "./RecipeAPI";
import {EssenceAPI} from "./EssenceAPI";
import {ComponentAPI} from "./ComponentAPI";
import {CraftingSystemAPI} from "./CraftingSystemAPI";
import {LocalizationService} from "../../applications/common/LocalizationService";
import {NotificationService} from "../foundry/NotificationService";
import Properties from "../Properties";
import {V2Component, V2CraftingSystem, V2Essence, V2Recipe} from "../repository/migration/V2SettingsModel";
import {CraftingSystem} from "../crafting/system/CraftingSystem";

const dialogLocalizationPath = `${Properties.module.id}.CraftingSystemDataExchanger`;

/**
 * A data exchanger for importing and exporting Crafting System data in a given format.
 *
 * @typeParam E - The type of the external data
 */
interface CraftingSystemDataExchanger<E> {

    notifications: NotificationService;

    /**
     * Imports the given data into Fabricate as a Crafting System.
     *
     * @async
     * @param importData - The data to import.
     * @param targetCraftingSystem - The optional Crafting System to import the data into. If not provided, a new Crafting
     * System will be created.
     * @returns {Promise<O>} A Promise that resolves to an object containing the imported data.
     */
    import(importData: E, targetCraftingSystem?: CraftingSystem): Promise<CraftingSystemData>;

    /**
     * Exports a complete Crafting System from Fabricate for the given Crafting System ID in the
     *
     * @async
     * @returns {Promise<I>} A Promise that resolves to the exported data.
     */
    export(craftingSystemId: string): Promise<E>;

}

export {CraftingSystemDataExchanger};

interface FabricateDataExchanger extends CraftingSystemDataExchanger<FabricateExportModel> {}

export {FabricateDataExchanger};

class DefaultFabricateDataExchanger implements FabricateDataExchanger {

    private readonly recipeAPI: RecipeAPI;
    private readonly essenceAPI: EssenceAPI;
    private readonly componentAPI: ComponentAPI;
    private readonly craftingSystemAPI: CraftingSystemAPI;
    private readonly localizationService: LocalizationService;
    private readonly notificationService: NotificationService;

    constructor({
        recipeAPI,
        essenceAPI,
        componentAPI,
        craftingSystemAPI,
        localizationService,
        notificationService,
    }: {
        recipeAPI: RecipeAPI;
        essenceAPI: EssenceAPI;
        componentAPI: ComponentAPI;
        craftingSystemAPI: CraftingSystemAPI;
        localizationService: LocalizationService;
        notificationService: NotificationService;
    }) {
        this.recipeAPI = recipeAPI;
        this.essenceAPI = essenceAPI;
        this.componentAPI = componentAPI;
        this.craftingSystemAPI = craftingSystemAPI;
        this.localizationService = localizationService;
        this.notificationService = notificationService;
    }

    get notifications(): NotificationService {
        return this.notificationService;
    }

    async import(importData: FabricateExportModel, targetCraftingSystem?: CraftingSystem): Promise<CraftingSystemData> {

        // If a target Crafting System is provided, ensure that the Crafting System ID in the import data matches the target.
        if (targetCraftingSystem && (targetCraftingSystem.id !== importData.craftingSystem.id)) {
            const message = this.localizationService.format(`${dialogLocalizationPath}.errors.importIdMismatch`, {
                systemName: targetCraftingSystem.details.name,
                expectedId: targetCraftingSystem.id,
                actualId: importData.craftingSystem.id,
            })
            ui.notifications.error(message);
            throw new Error(message);
        }

        // Upgrade the import model if necessary and validate the import data.
        importData = this.upgradeV1ImportData(importData);
        await this.validateImportData(importData);

        try {
            const importedCraftingSystem = await this.craftingSystemAPI.insert(importData.craftingSystem);
            const importedEssences = await this.essenceAPI.insertMany(importData.essences);
            const importedComponents = await this.componentAPI.insertMany(importData.components);
            const importedRecipes = await this.recipeAPI.insertMany(importData.recipes);
            const message = this.localizationService.format(
                `${Properties.module.id}.settings.craftingSystem.import.success`,
                {
                    systemName: importedCraftingSystem.details.name,
                    essenceCount: importedEssences.length,
                    componentCount: importedComponents.length,
                    recipeCount: importedRecipes.length,
                }
            );
            this.notificationService.info(message);
            return {
                craftingSystem: importedCraftingSystem,
                essences: importedEssences,
                components: importedComponents,
                recipes: importedRecipes,
            }
        } catch (e: any) {
            const message = this.localizationService.format(
                `${Properties.module.id}.settings.craftingSystem.import.failure`,
                { systemName: importData?.craftingSystem?.details?.name, cause: e.message }
            );
            this.notificationService.error(message);
        }

    }

    private async validateImportData(importData: FabricateExportModel) {

        const errors: string[] = [];

        if (!importData) {
            errors.push(this.localizationService.localize(`${Properties.module.id}.settings.craftingSystem.import.invalidData.noData`));
        }

        if (!importData.version || typeof importData.version !== "string") {
            errors.push(this.localizationService.localize(`${Properties.module.id}.settings.craftingSystem.import.invalidData.noVersion`));
        }

        if (!importData.craftingSystem || typeof importData.craftingSystem !== "object") {
            errors.push(this.localizationService.localize(`${Properties.module.id}.settings.craftingSystem.import.invalidData.noCraftingSystem`));
        }

        if (!importData.essences || !Array.isArray(importData.essences)) {
            errors.push(this.localizationService.localize(`${Properties.module.id}.settings.craftingSystem.import.invalidData.noEssences`));
        }

        if (!importData.components || !Array.isArray(importData.components)) {
            errors.push(this.localizationService.localize(`${Properties.module.id}.settings.craftingSystem.import.invalidData.noComponents`));
        }

        if (!importData.recipes || !Array.isArray(importData.recipes)) {
            errors.push(this.localizationService.localize(`${Properties.module.id}.settings.craftingSystem.import.invalidData.noRecipes`));
        }

        if (errors.length > 0) {
            const message = this.localizationService.format(`${Properties.module.id}.settings.craftingSystem.import.invalidData.summary`, { errors: errors.join(', ') });
            this.notificationService.error(message);
            throw new Error(message);
        }

    }

    private upgradeV1ImportData(importData: FabricateExportModel) {

        if (importData?.version === "V2") {
            return importData;
        }

        if (!importData || !("parts" in importData)) {
            const message = this.localizationService.localize(`${Properties.module.id}.settings.craftingSystem.import.upgrade.failure`);
            this.notificationService.error(message);
            throw new Error(message);
        }

        const legacyImportData: V2CraftingSystem = importData as unknown as V2CraftingSystem;
        const upgradedImportData: FabricateExportModel = {
            version: "V2",
            craftingSystem: {
                id: legacyImportData.id,
                details: {
                    name: legacyImportData.details.name,
                    author: legacyImportData.details.author,
                    summary: legacyImportData.details.summary,
                    description: legacyImportData.details.description,
                },
                disabled: legacyImportData.enabled === false,
            },
            essences: Object.keys(legacyImportData.parts.essences).map(essenceId => {
                const legacyEssence: V2Essence = legacyImportData.parts.essences[essenceId];
                return {
                    id: essenceId,
                    craftingSystemId: legacyImportData.id,
                    disabled: false,
                    ...legacyEssence,
                }
            }),
            components: Object.keys(legacyImportData.parts.components).map(componentId => {
                const legacyComponent: V2Component = legacyImportData.parts.components[componentId];
                return {
                    id: componentId,
                    craftingSystemId: legacyImportData.id,
                    disabled: legacyComponent.disabled,
                    essences: legacyComponent.essences,
                    itemUuid: legacyComponent.itemUuid,
                    salvageOptions: Object.keys(legacyComponent.salvageOptions).map(salvageOptionId => {
                        const legacySalvageOption = legacyComponent.salvageOptions[salvageOptionId];
                        return {
                            id: salvageOptionId,
                            name: salvageOptionId,
                            catalysts: {},
                            results: legacySalvageOption
                        }
                    }),
                }
            }),
            recipes: Object.keys(legacyImportData.parts.recipes).map(recipeId => {
                const legacyRecipe: V2Recipe = legacyImportData.parts.recipes[recipeId];
                return {
                    id: recipeId,
                    craftingSystemId: legacyImportData.id,
                    disabled: legacyRecipe.disabled,
                    itemUuid: legacyRecipe.itemUuid,
                    requirementOptions: Object.keys(legacyRecipe.ingredientOptions).map(ingredientOptionId => {
                        const legacyIngredientOption = legacyRecipe.ingredientOptions[ingredientOptionId];
                        return {
                            id: ingredientOptionId,
                            name: ingredientOptionId,
                            ingredients: legacyIngredientOption.ingredients,
                            catalysts: legacyIngredientOption.catalysts,
                            essences: legacyRecipe.essences,
                        }
                    }),
                    resultOptions: Object.keys(legacyRecipe.resultOptions).map(resultOptionId => {
                        const legacyResultOption = legacyRecipe.resultOptions[resultOptionId];
                        return {
                            id: resultOptionId,
                            name: resultOptionId,
                            results: legacyResultOption,
                        }
                    }),
                }
            })
        };
        return upgradedImportData;
    }

    async export(craftingSystemId: string): Promise<FabricateExportModel> {

        const craftingSystem = await this.craftingSystemAPI.getById(craftingSystemId);

        if (!craftingSystem) {
            const message = this.localizationService.format(
                `${Properties.module.id}.settings.craftingSystem.export.craftingSystemNotFound`,
                { craftingSystemId }
            );
            this.notificationService.error(message);
            throw new Error(message);
        }

        const essences = await this.essenceAPI.getAllByCraftingSystemId(craftingSystemId);
        const components = await this.componentAPI.getAllByCraftingSystemId(craftingSystemId);
        const recipes = await this.recipeAPI.getAllByCraftingSystemId(craftingSystemId);

        return {
            version: "V2",
            craftingSystem: {
                id: craftingSystem.id,
                details: {
                    name: craftingSystem.details.name,
                    summary: craftingSystem.details.summary,
                    description: craftingSystem.details.description,
                    author: craftingSystem.details.author,
                },
                disabled: craftingSystem.isDisabled,
            },
            essences: Array.from(essences.values()).map(essence => essence.toJson()),
            components: Array.from(components.values()).map(component => {
                const componentJson = component.toJson();
                return {
                    ...componentJson,
                    salvageOptions: Object.values(componentJson.salvageOptions),
                }
            }),
            recipes: Array.from(recipes.values()).map(recipe => {
                const recipeJson = recipe.toJson();
                return {
                    ...recipeJson,
                    requirementOptions: Object.values(recipeJson.requirementOptions),
                    resultOptions: Object.values(recipeJson.resultOptions),
                }
            })
        };
    }

}

export {DefaultFabricateDataExchanger};

// =====================================================================================================================
// MasterCrafted Type Definitions
// =====================================================================================================================

interface IngredientMasterCrafted {
    id: string;
    name?: string;
    components?: ComponentMasterCrafted[];
    recipe?: RecipeMasterCrafted;
}

interface ProductMasterCrafted {
    id: string;
    name: string;
    components: ComponentMasterCrafted[];
}

interface ComponentMasterCrafted {
    id?: string;
    uuid?: string;
    quantity?: number;
    name?: string;
}

interface RecipeMasterCrafted {
    id?: string;
    name?: string;
    description?: string;
    time?: number;
    macroName?: string;
    recipeBook?: RecipeBookMasterCrafted;
    ingredients?: IngredientMasterCrafted[];
    products?: ProductMasterCrafted[];
    tools?: string[];
    sound?: string;
    ownership?: Record<string, unknown>;
    ingredientsInspection?: 0 | 1;
    productInspection?: 0 | 1;
    img?: string;
}

interface RecipeBookMasterCrafted {
    id: string;
    name: string;
    description: string;
    recipes?: RecipeMasterCrafted[];
    tools?: string[];
    sound?: string;
    ownership?: Record<string, unknown>;
    ingredientsInspection?: 0 | 1;
    productInspection?: 0 | 1;
    img: string;
}

export {IngredientMasterCrafted, ProductMasterCrafted, ComponentMasterCrafted, RecipeMasterCrafted, RecipeBookMasterCrafted};

interface MasterCraftedDataExchanger extends CraftingSystemDataExchanger<RecipeBookMasterCrafted> {}

export {MasterCraftedDataExchanger};

class DefaultMasterCraftedDataExchanger implements MasterCraftedDataExchanger {

    private readonly recipeAPI: RecipeAPI;
    private readonly essenceAPI: EssenceAPI;
    private readonly componentAPI: ComponentAPI;
    private readonly craftingSystemAPI: CraftingSystemAPI;
    private readonly localizationService: LocalizationService;
    private readonly notificationService: NotificationService;

    constructor({
        recipeAPI,
        essenceAPI,
        componentAPI,
        craftingSystemAPI,
        localizationService,
        notificationService,
    }: {
        recipeAPI: RecipeAPI;
        essenceAPI: EssenceAPI;
        componentAPI: ComponentAPI;
        craftingSystemAPI: CraftingSystemAPI;
        localizationService: LocalizationService;
        notificationService: NotificationService;
    }) {
        this.recipeAPI = recipeAPI;
        this.essenceAPI = essenceAPI;
        this.componentAPI = componentAPI;
        this.craftingSystemAPI = craftingSystemAPI;
        this.localizationService = localizationService;
        this.notificationService = notificationService;
    }

    get notifications(): NotificationService {
        return this.notificationService;
    }

    async import(_importData: RecipeBookMasterCrafted): Promise<CraftingSystemData> {
        throw new Error("Method not implemented.");
    }

    async export(_craftingSystemId: string): Promise<RecipeBookMasterCrafted> {
        throw new Error("Method not implemented.");
    }

}

export {DefaultMasterCraftedDataExchanger};
