import {CraftingSystemAPI, DefaultCraftingSystemAPI} from "./CraftingSystemAPI";
import {DefaultEssenceAPI, EssenceAPI} from "./EssenceAPI";
import {ComponentAPI, DefaultComponentAPI} from "./ComponentAPI";
import {DefaultRecipeAPI, RecipeAPI} from "./RecipeAPI";
import {DefaultIdentityFactory} from "../foundry/IdentityFactory";
import {DefaultLocalizationService} from "../../applications/common/LocalizationService";
import {DefaultGameProvider} from "../foundry/GameProvider";
import {DefaultSettingManager} from "./SettingManager";
import Properties from "../Properties";
import {CraftingSystem, CraftingSystemJson, CraftingSystemValidator} from "../system/CraftingSystem";
import {EntityDataStore} from "./EntityDataStore";
import {CraftingSystemFactory} from "../system/CraftingSystemFactory";
import {CraftingSystemCollectionManager} from "./CollectionManager";

interface FabricateAPIFactory {

    make(): FabricateAPI;

}

export { FabricateAPIFactory }

class DefaultFabricateApiFactory implements FabricateAPIFactory {

    private readonly gameSystem: string;
    private readonly user: string;
    private readonly clientSettings: ClientSettings;

    constructor({
        gameSystem,
        user,
        clientSettings
    }: {
        gameSystem: string;
        user: string;
        clientSettings: ClientSettings;
    }) {
        this.gameSystem = gameSystem;
        this.user = user;
        this.clientSettings = clientSettings;
    }

    make(): FabricateAPI {

        const notificationService = new DefaultNotificationService();
        const identityFactory = new DefaultIdentityFactory();
        const gameProvider = new DefaultGameProvider();
        const localizationService = new DefaultLocalizationService(gameProvider);

        const craftingSystemApi = this.makeCraftingSystemApi(notificationService, identityFactory, localizationService);
        const essenceApi = this.makeEssenceAPI(notificationService, identityFactory, localizationService);
        const componentApi = this.makeComponentAPI(notificationService, identityFactory, localizationService, essenceApi);
        const recipeApi = this.makeRecipeAPI(notificationService, identityFactory, localizationService, essenceApi, componentApi);

        return new DefaultFabricateApi({
            craftingSystemApi,
            essenceApi,
            componentApi,
            recipeApi
        });

    }

    private makeCraftingSystemApi(notificationService: DefaultNotificationService,
                                  identityFactory: DefaultIdentityFactory,
                                  localizationService: DefaultLocalizationService) {
        return new DefaultCraftingSystemAPI({
            gameSystem: this.gameSystem,
            user: this.user,
            notificationService,
            identityFactory,
            localizationService,
            craftingSystemValidator: new CraftingSystemValidator(),
            craftingSystemStore: new EntityDataStore<CraftingSystemJson, CraftingSystem>({
                entityName: "Crafting System",
                entityFactory: new CraftingSystemFactory(),
                collectionManager: new CraftingSystemCollectionManager(),
                settingManager: new DefaultSettingManager({
                    moduleId: Properties.module.id,
                    settingKey: "craftingSystems",
                    clientSettings: this.clientSettings

                })
            })
        });
    }

    private makeEssenceAPI(notificationService: DefaultNotificationService,
                           identityFactory: DefaultIdentityFactory,
                           localizationService: DefaultLocalizationService): EssenceAPI {
        return new DefaultEssenceAPI();
    }

    private makeComponentAPI(notificationService: DefaultNotificationService,
                             identityFactory: DefaultIdentityFactory,
                             localizationService: DefaultLocalizationService,
                             essenceAPI: EssenceAPI): ComponentAPI {
        return new DefaultComponentAPI();
    }

    private makeRecipeAPI(notificationService: DefaultNotificationService,
                          identityFactory: DefaultIdentityFactory,
                          localizationService: DefaultLocalizationService,
                          essenceAPI: EssenceAPI,
                          componentAPI: ComponentAPI): RecipeAPI {
        return new DefaultRecipeAPI();
    }

}

export { DefaultFabricateApiFactory }

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
export { FabricateAPI }

class DefaultFabricateApi implements FabricateAPI {

    private readonly recipeApi: RecipeAPI;
    private readonly componentApi: ComponentAPI;
    private readonly essenceApi: EssenceAPI;
    private readonly craftingSystemApi: CraftingSystemAPI;

    constructor({
        recipeApi,
        componentApi,
        essenceApi,
        craftingSystemApi,
    }: {
        recipeApi: RecipeAPI;
        componentApi: ComponentAPI;
        essenceApi: EssenceAPI;
        craftingSystemApi: CraftingSystemAPI;
    }) {
        this.recipeApi = recipeApi;
        this.componentApi = componentApi;
        this.essenceApi = essenceApi;
        this.craftingSystemApi = craftingSystemApi;
    }

    get craftingSystems(): CraftingSystemAPI {
        return this.craftingSystemApi;
    }

    get essences(): EssenceAPI {
        return this.essenceApi;
    }

    get components(): ComponentAPI {
        return this.componentApi;
    }

    get recipes(): RecipeAPI {
        return this.recipeApi;
    }

    readonly dataModelVersion: string;

    migrateData(): Promise<void> {
        return Promise.resolve(undefined);
    }

}


export { DefaultFabricateApi }