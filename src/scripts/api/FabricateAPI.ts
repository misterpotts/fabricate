import {CraftingSystemAPI} from "./CraftingSystemAPI";
import {EssenceAPI} from "./EssenceAPI";
import {ComponentAPI} from "./ComponentAPI";
import {RecipeAPI} from "./RecipeAPI";
import {SettingMigrationAPI} from "./SettingMigrationAPI";
import {CraftingAPI} from "./CraftingAPI";

interface EntityCountStatistics {

    count: number;

    ids: string[];

}

export { EntityCountStatistics }

interface EntityCountStatisticsByCraftingSystem extends EntityCountStatistics {

    byCraftingSystem: Record<string, EntityCountStatistics>;

}

export { EntityCountStatisticsByCraftingSystem }

interface FabricateStatistics {

    craftingSystems: EntityCountStatistics;

    essences: EntityCountStatisticsByCraftingSystem;

    components: EntityCountStatisticsByCraftingSystem;

    recipes: EntityCountStatisticsByCraftingSystem;

}

export { FabricateStatistics }

/**
 * Represents an API for managing crafting systems, components, essences, and recipes.
 *
 * @interface
 */
interface FabricateAPI {

    /**
     * Gets the API for managing crafting systems.
     */
    readonly craftingSystems: CraftingSystemAPI;

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

}
export { FabricateAPI }

class DefaultFabricateAPI implements FabricateAPI {

    private readonly recipeAPI: RecipeAPI;
    private readonly essenceAPI: EssenceAPI;
    private readonly craftingAPI: CraftingAPI;
    private readonly componentAPI: ComponentAPI;
    private readonly craftingSystemAPI: CraftingSystemAPI;
    private readonly settingMigrationAPI: SettingMigrationAPI;

    constructor({
        recipeAPI,
        essenceAPI,
        craftingAPI,
        componentAPI,
        craftingSystemAPI,
        settingMigrationAPI,
    }: {
        recipeAPI: RecipeAPI;
        essenceAPI: EssenceAPI;
        craftingAPI: CraftingAPI;
        componentAPI: ComponentAPI;
        craftingSystemAPI: CraftingSystemAPI;
        settingMigrationAPI: SettingMigrationAPI;
    }) {
        this.recipeAPI = recipeAPI;
        this.essenceAPI = essenceAPI;
        this.craftingAPI = craftingAPI;
        this.componentAPI = componentAPI;
        this.craftingSystemAPI = craftingSystemAPI;
        this.settingMigrationAPI = settingMigrationAPI;
    }

    activateNotifications(): void {
        this.setNotificationsSuppressed(false);
    }

    suppressNotifications(): void {
        this.setNotificationsSuppressed(true);
    }

    private setNotificationsSuppressed(value: boolean): void {
        this.componentAPI.notifications.suppressed = value;
        this.essenceAPI.notifications.suppressed = value;
        this.craftingSystemAPI.notifications.suppressed = value;
        this.recipeAPI.notifications.suppressed = value;
    }

    get craftingSystems(): CraftingSystemAPI {
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

}


export { DefaultFabricateAPI }