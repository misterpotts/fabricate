import {CraftingSystemAPI} from "./CraftingSystemAPI";
import {EssenceAPI} from "./EssenceAPI";
import {ComponentAPI} from "./ComponentAPI";
import {RecipeAPI} from "./RecipeAPI";
import {SettingMigrationAPI} from "./SettingMigrationAPI";
import {CraftingAPI} from "./CraftingAPI";
import {Recipe} from "../crafting/recipe/Recipe";
import {Component} from "../crafting/component/Component";
import {Essence} from "../crafting/essence/Essence";
import {CraftingSystem} from "../crafting/system/CraftingSystem";
import Properties from "../Properties";
import {NotificationService} from "../foundry/NotificationService";
import {LocalizationService} from "../../applications/common/LocalizationService";
import {DefaultDocumentManager, DocumentManager} from "../foundry/DocumentManager";
import {DataExchangeAPI} from "./DataExchangeAPI";

/**
 * Contains summary statistics about an Entity type in the Fabricate database.
 */
interface EntityCountStatistics {

    /**
     * The number of the Entity type in the Fabricate database.
     */
    count: number;

    /**
     * The IDs of the Entity type in the Fabricate database.
     */
    ids: string[];

}

export { EntityCountStatistics }

/**
 * Contains summary statistics about an Entity type in the Fabricate database, grouped by Crafting System ID.
 */
interface EntityCountStatisticsByCraftingSystem extends EntityCountStatistics {

    /**
     * The number and IDs of the Entity type in the Fabricate database, grouped by Crafting System ID.
     */
    byCraftingSystem: Record<string, EntityCountStatistics>;

}

export { EntityCountStatisticsByCraftingSystem }

/**
 * Contains summary statistics about the Crafting Systems, Essences, Components, and Recipes in the Fabricate database.
 */
interface FabricateStatistics {

    /**
     * The number and IDs of Crafting Systems in the Fabricate database.
     */
    craftingSystems: EntityCountStatistics;

    /**
     * The number and IDs of Essences in the Fabricate database.
     */
    essences: EntityCountStatisticsByCraftingSystem;

    /**
     * The number and IDs of Components in the Fabricate database.
     */
    components: EntityCountStatisticsByCraftingSystem;

    /**
     * The number and IDs of Recipes in the Fabricate database.
     */
    recipes: EntityCountStatisticsByCraftingSystem;

}

export { FabricateStatistics }


/**
 * Contains all the entities in a Crafting System.
 */
interface CraftingSystemData {

    /**
     * The Crafting System to which all other entities in this `CraftingSystemData` instance belong.
     */
    craftingSystem: CraftingSystem;

    /**
     * The Essences in the Crafting System.
     */
    essences: Essence[];

    /**
     * The Components in the Crafting System.
     */
    components: Component[];

    /**
     * The Recipes in the Crafting System.
     */
    recipes: Recipe[];

}

export { CraftingSystemData }

/**
 * Represents an API for managing crafting systems, components, essences, and recipes.
 */
interface FabricateAPI {

    /**
     * Gets the API for managing crafting systems.
     */
    readonly systems: CraftingSystemAPI;

    /**
     * Gets the API for managing essences.
     */
    readonly essences: EssenceAPI;

    /**
     * Gets the API for managing components.
     */
    readonly components: ComponentAPI;

    /**
     * Gets the API for managing recipes.
     */
    readonly recipes: RecipeAPI;

    /**
     * Gets the API for managing Fabricate's data migrations.
     */
    readonly migration: SettingMigrationAPI;

    /**
     * Gets the API for performing crafting.
     */
    readonly crafting: CraftingAPI;

    /**
     * Gets an instance of the Fabricate Document manager, used for loading Foundry Documents and extracting the data
     *   they contain that is relevant to Fabricate.
     */
    readonly documentManager: DocumentManager;

    /**
     * Gets the API for exchanging data with external systems.
     */
    readonly dataExchangeAPI: DataExchangeAPI;

    /**
     * Suppresses notifications from Fabricate for all operations. Use {@link FabricateAPI#activateNotifications} to
     * re-enable notifications.
     */
    suppressNotifications(): void;

    /**
     * Activates notifications from Fabricate for all operations. Use {@link FabricateAPI#suppressNotifications} to
     * suppress notifications.
     */
    activateNotifications(): void;

    /**
     * Gets summary statistics about the Crafting Systems, Essences, Components, and Recipes in the Fabricate database.
     *
     * @async
     * @returns {Promise<FabricateStatistics>} A Promise that resolves with the Fabricate statistics.
     */
    getStatistics(): Promise<FabricateStatistics>;

    /**
     * Deletes all Crafting Systems, Essences, Components, and Recipes in the Fabricate database for the given Crafting
     *  System id.
     *
     * @async
     * @param id - The ID of the Crafting System to delete.
     * @returns {Promise<void>} A Promise that resolves to an object containing the deleted Crafting System, Essences,
     *   Components, and Recipes.
     */
    deleteAllByCraftingSystemId(id: string): Promise<CraftingSystemData>;

    /**
     * Duplicates the Crafting System with the given ID. The copy will have the same name as the original, with the
     *   suffix "Copy" appended to it. All Essences, Components, and Recipes in the Crafting System will also be
     *   duplicated.
     *
     * @async
     * @param sourceCraftingSystemId - The ID of the Crafting System to duplicate.
     * @returns {Promise<CraftingSystemData>} A Promise that resolves to an object containing the duplicated Crafting
     *   System, Essences, Components, and Recipes.
     */
    duplicateCraftingSystem(sourceCraftingSystemId: string): Promise<CraftingSystemData>;

    /**
     * Downloads a copy of all Fabricate data as a JSON file. This function is used for debugging and troubleshooting.
     * If you want to export data from Fabricate for use in another Foundry VTT world, use {@link FabricateAPI#export}
     */
    downloadData(): void;

}

export { FabricateAPI }

class DefaultFabricateAPI implements FabricateAPI {

    private readonly recipeAPI: RecipeAPI;
    private readonly essenceAPI: EssenceAPI;
    private readonly craftingAPI: CraftingAPI;
    private readonly componentAPI: ComponentAPI;
    private readonly _documentManager: DocumentManager;
    private readonly _dataExchangeAPI: DataExchangeAPI;
    private readonly craftingSystemAPI: CraftingSystemAPI;
    private readonly localizationService: LocalizationService;
    private readonly notificationService: NotificationService;
    private readonly settingMigrationAPI: SettingMigrationAPI;

    constructor({
        recipeAPI,
        essenceAPI,
        craftingAPI,
        componentAPI,
        documentManager = new DefaultDocumentManager(),
        dataExchangeAPI,
        craftingSystemAPI,
        localizationService,
        notificationService,
        settingMigrationAPI,
    }: {
        recipeAPI: RecipeAPI;
        essenceAPI: EssenceAPI;
        craftingAPI: CraftingAPI;
        componentAPI: ComponentAPI;
        documentManager?: DocumentManager;
        dataExchangeAPI: DataExchangeAPI;
        craftingSystemAPI: CraftingSystemAPI;
        localizationService: LocalizationService;
        notificationService: NotificationService;
        settingMigrationAPI: SettingMigrationAPI;
    }) {
        this.recipeAPI = recipeAPI;
        this.essenceAPI = essenceAPI;
        this.craftingAPI = craftingAPI;
        this.componentAPI = componentAPI;
        this._documentManager = documentManager;
        this._dataExchangeAPI = dataExchangeAPI;
        this.craftingSystemAPI = craftingSystemAPI;
        this.localizationService = localizationService;
        this.notificationService = notificationService;
        this.settingMigrationAPI = settingMigrationAPI;
    }

    get dataExchangeAPI(): DataExchangeAPI {
        return this._dataExchangeAPI;
    }

    /**
     * @deprecated Use {@link DataExchangeAPI#downloadData} instead.
     */
    downloadData(): void {
        console.warn("FabricateAPI#downloadData is deprecated. Use DataExchangeAPI#downloadData instead.")
        this.dataExchangeAPI.downloadData();
    }

    get documentManager(): DocumentManager {
        return this._documentManager;
    }

    activateNotifications(): void {
        this.setNotificationsSuppressed(false);
    }

    suppressNotifications(): void {
        this.setNotificationsSuppressed(true);
    }

    private setNotificationsSuppressed(value: boolean): void {
        this.notificationService.isSuppressed = value;
        this.componentAPI.notifications.isSuppressed = value;
        this.essenceAPI.notifications.isSuppressed = value;
        this.craftingSystemAPI.notifications.isSuppressed = value;
        this.recipeAPI.notifications.isSuppressed = value;
        this.dataExchangeAPI.fabricate.notifications.isSuppressed = value;
        this.dataExchangeAPI.masterCrafted.notifications.isSuppressed = value;
    }

    get systems(): CraftingSystemAPI {
        return this.craftingSystemAPI;
    }

    get essences(): EssenceAPI {
        return this.essenceAPI;
    }

    get components(): ComponentAPI {
        return this.componentAPI;
    }

    get recipes(): RecipeAPI {
        return this.recipeAPI;
    }

    get migration(): SettingMigrationAPI {
        return this.settingMigrationAPI;
    }

    get crafting(): CraftingAPI {
        return this.craftingAPI;
    }

    async getStatistics(): Promise<FabricateStatistics> {
        const craftingSystems = await this.craftingSystemAPI.getAll();
        const craftingSystemIds = Array.from(craftingSystems.keys());

        const essences = await this.essenceAPI.getAll();
        const essenceStatsByCraftingSystem = Array.from(essences.values())
            .reduce((statistics, essence) => {
                const essenceStats = statistics[essence.craftingSystemId] ?? {
                    count: 0,
                    ids: [],
                };
                essenceStats.count++;
                essenceStats.ids.push(essence.id);
                statistics[essence.craftingSystemId] = essenceStats;
                return statistics;
            }, <Record<string, EntityCountStatistics>>{});

        const components = await this.componentAPI.getAll();
        const componentStatsByCraftingSystem = Array.from(components.values())
            .reduce((statistics, component) => {
                const componentStats = statistics[component.craftingSystemId] ?? {
                    count: 0,
                    ids: [],
                };
                componentStats.count++;
                componentStats.ids.push(component.id);
                statistics[component.craftingSystemId] = componentStats;
                return statistics;
            }, <Record<string, EntityCountStatistics>>{});

        const recipes = await this.recipeAPI.getAll();
        const recipeStatsByCraftingSystem = Array.from(recipes.values())
            .reduce((statistics, recipe) => {
                const recipeStats = statistics[recipe.craftingSystemId] ?? {
                    count: 0,
                    ids: [],
                };
                recipeStats.count++;
                recipeStats.ids.push(recipe.id);
                statistics[recipe.craftingSystemId] = recipeStats;
                return statistics;
            }, <Record<string, EntityCountStatistics>>{});

        return {
            craftingSystems: {
                count: craftingSystems.size,
                ids: craftingSystemIds,
            },
            essences: {
                count: essences.size,
                ids: Array.from(essences.keys()),
                byCraftingSystem: essenceStatsByCraftingSystem,
            },
            components: {
                count: components.size,
                ids: Array.from(components.keys()),
                byCraftingSystem: componentStatsByCraftingSystem,
            },
            recipes: {
                count: recipes.size,
                ids: Array.from(recipes.keys()),
                byCraftingSystem: recipeStatsByCraftingSystem,
            }
        }
    }

    async deleteAllByCraftingSystemId(id: string): Promise<CraftingSystemData> {

        const [
            craftingSystem,
            essences,
            components,
            recipes
        ] = await Promise.all([
            this.craftingSystemAPI.deleteById(id),
            this.essenceAPI.deleteByCraftingSystemId(id),
            this.componentAPI.deleteByCraftingSystemId(id),
            this.recipeAPI.deleteByCraftingSystemId(id),
        ]);

        const message = craftingSystem ?
            this.localizationService.format(`${Properties.module.id}.settings.craftingSystem.deleted`, { systemName: craftingSystem.details.name })
            : this.localizationService.format(`${Properties.module.id}.settings.craftingSystem.deletedById`, { craftingSystemId: id });
        this.notificationService.info(message);

        return {
            craftingSystem,
            essences,
            components,
            recipes
        }

    }

    async duplicateCraftingSystem(sourceCraftingSystemId: string): Promise<CraftingSystemData> {

        const result: CraftingSystemData = {
            craftingSystem: null,
            essences: [],
            components: [],
            recipes: [],
        };

        try {

            const clonedCraftingSystem = await this.craftingSystemAPI.cloneById(sourceCraftingSystemId);
            result.craftingSystem = clonedCraftingSystem;

            const sourceEssences = await this.essenceAPI.getAllByCraftingSystemId(sourceCraftingSystemId);
            const essenceCloneResult = await this.essenceAPI.cloneAll(Array.from(sourceEssences.values()), clonedCraftingSystem.id);
            result.essences = essenceCloneResult.essences;

            const sourceComponents = await this.componentAPI.getAllByCraftingSystemId(sourceCraftingSystemId);
            const componentCloneResult = await this.componentAPI.cloneAll(Array.from(sourceComponents.values()), clonedCraftingSystem.id, essenceCloneResult.idLinks);
            result.components = componentCloneResult.components;

            const sourceRecipes = await this.recipeAPI.getAllByCraftingSystemId(sourceCraftingSystemId);
            const recipeCloneResult = await this.recipeAPI.cloneAll(Array.from(sourceRecipes.values()), clonedCraftingSystem.id, essenceCloneResult.idLinks, componentCloneResult.idLinks);
            result.recipes = recipeCloneResult.recipes;

        } catch (e: any) {
            const error = e instanceof Error ? e : new Error(e);
            const message = this.localizationService.format(
                `${Properties.module.id}.settings.craftingSystem.duplicate.failure`,
                {
                    systemId: sourceCraftingSystemId,
                    cause: error.message
                }
            );
            this.notificationService.error(message);
            return result;
        }

        const message = this.localizationService.format(
            `${Properties.module.id}.settings.craftingSystem.duplicate.success`,
            {
                cloneId: result.craftingSystem.id,
                systemId: sourceCraftingSystemId,
            }
        );
        this.notificationService.info(message);

        return result;
    }

}


export { DefaultFabricateAPI }