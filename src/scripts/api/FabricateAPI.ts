import {CraftingSystemApi, DefaultCraftingSystemApi} from "./CraftingSystemApi";
import {EssenceApi} from "./EssenceApi";
import {ComponentApi} from "./ComponentApi";
import {RecipeApi} from "./RecipeApi";
import {DefaultIdentityFactory} from "../foundry/IdentityFactory";
import {DefaultLocalizationService} from "../../applications/common/LocalizationService";
import {DefaultGameProvider} from "../foundry/GameProvider";
import {DefaultSettingManager} from "./SettingManager";
import Properties from "../Properties";
import {CraftingSystemSettingValidator} from "./CraftingSystemSettingValidator";

interface FabricateApiFactory {

    make(): FabricateApi;

}

export { FabricateApiFactory }

class DefaultFabricateApiFactory implements FabricateApiFactory {

    private readonly gameSystem: string;


    make(): FabricateApi {

        const notificationService = new DefaultNotificationService();
        const identityFactory = new DefaultIdentityFactory();
        const gameProvider = new DefaultGameProvider();
        const localizationService = new DefaultLocalizationService(gameProvider);

        const craftingSystemApi = new DefaultCraftingSystemApi({
            gameSystem: this.gameSystem,
            notificationService,
            identityFactory,
            localizationService,
            settingManager: new DefaultSettingManager({
                moduleId: Properties.module.id,
                settingKey: "craftingSystems",
                notificationService,
                localizationService,
                settingValidator: new CraftingSystemSettingValidator(),
                clientSettings: gameProvider.get().settings
            })
        });
        return new DefaultFabricateApi({
            craftingSystemApi,
            essenceApi: undefined,
            componentApi: undefined,
            recipeApi: undefined
        });

    }

}

export { DefaultFabricateApiFactory }

/**
 * Represents an API for managing crafting systems, components, essences, and recipes.
 *
 * @interface
 */
interface FabricateApi {

    /**
     * Gets the API for managing crafting systems.
     */
    readonly craftingSystems: CraftingSystemApi;

    /**
     * Gets the API for managing essences.
     */
    readonly essences: EssenceApi;

    /**
     * Gets the API for managing components.
     */
    readonly components: ComponentApi;

    /**
     * Gets the API for managing recipes.
     */
    readonly recipes: RecipeApi;

    /**
     * Migrates Fabricate's stored data from older model versions to the most recent
     *
     * @async
     * @return { Promise<void> } a promise that resolves when the data migration has been completed
     * */
    migrateData(): Promise<void>;

    /**
     * Gets the most recent Fabricate data model version
     * */
    readonly dataModelVersion: string;

}
export { FabricateApi }

class DefaultFabricateApi implements FabricateApi {

    private readonly recipeApi: RecipeApi;
    private readonly componentApi: ComponentApi;
    private readonly essenceApi: EssenceApi;
    private readonly craftingSystemApi: CraftingSystemApi;

    constructor({
        recipeApi,
        componentApi,
        essenceApi,
        craftingSystemApi,
    }: {
        recipeApi: RecipeApi;
        componentApi: ComponentApi;
        essenceApi: EssenceApi;
        craftingSystemApi: CraftingSystemApi;
    }) {
        this.recipeApi = recipeApi;
        this.componentApi = componentApi;
        this.essenceApi = essenceApi;
        this.craftingSystemApi = craftingSystemApi;
    }

    get craftingSystems(): CraftingSystemApi {
        return this.craftingSystemApi;
    }

    get essences(): EssenceApi {
        return this.essenceApi;
    }

    get components(): ComponentApi {
        return this.componentApi;
    }

    get recipes(): RecipeApi {
        return this.recipeApi;
    }

}


export { DefaultFabricateApi }