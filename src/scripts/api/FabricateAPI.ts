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
import {
    ComponentCollectionManager,
    CraftingSystemCollectionManager,
    EssenceCollectionManager
} from "./CollectionManager";
import {EssenceValidator} from "../crafting/essence/EssenceValidator";
import {DefaultDocumentManager, DocumentManager} from "../foundry/DocumentManager";
import {Essence, EssenceJson} from "../crafting/essence/Essence";
import {EssenceFactory} from "../crafting/essence/EssenceFactory";
import {ComponentValidator} from "../crafting/component/ComponentValidator";
import {Component, ComponentJson} from "../crafting/component/Component";
import {ComponentFactory} from "../crafting/component/ComponentFactory";

interface FabricateAPIFactory {

    make(): FabricateAPI;

}

export { FabricateAPIFactory }

class DefaultFabricateAPIFactory implements FabricateAPIFactory {

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

        const identityFactory = new DefaultIdentityFactory();
        const gameProvider = new DefaultGameProvider();
        const localizationService = new DefaultLocalizationService(gameProvider);
        const documentManager = new DefaultDocumentManager();

        const craftingSystemAPI = this.makeCraftingSystemAPI(identityFactory, localizationService);
        const essenceAPI = this.makeEssenceAPI(identityFactory, localizationService, craftingSystemAPI, documentManager);
        const componentAPI = this.makeComponentAPI(identityFactory, localizationService, craftingSystemAPI, essenceAPI);
        const recipeAPI = this.makeRecipeAPI(identityFactory, localizationService, essenceAPI, componentAPI);

        return new DefaultFabricateAPI({
            craftingSystemAPI: craftingSystemAPI,
            essenceAPI: essenceAPI,
            componentAPI: componentAPI,
            recipeAPI: recipeAPI
        });

    }

    private makeCraftingSystemAPI(identityFactory: DefaultIdentityFactory,
                                  localizationService: DefaultLocalizationService) {
        return new DefaultCraftingSystemAPI({
            gameSystem: this.gameSystem,
            user: this.user,
            notificationService: new DefaultNotificationService(),
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

    private makeEssenceAPI(identityFactory: DefaultIdentityFactory,
                           localizationService: DefaultLocalizationService,
                           craftingSystemAPI: CraftingSystemAPI,
                           documentManager: DocumentManager): EssenceAPI {
        const essenceValidator = new EssenceValidator({ craftingSystemAPI, documentManager });
        const essenceStore = new EntityDataStore<EssenceJson, Essence>({
            entityName: "Essence",
            collectionManager: new EssenceCollectionManager(),
            settingManager: new DefaultSettingManager({
                moduleId: Properties.module.id,
                settingKey: "essences",
                clientSettings: this.clientSettings
            }),
            entityFactory: new EssenceFactory(documentManager),
        });
        return new DefaultEssenceAPI({
            notificationService: new DefaultNotificationService(),
            localizationService,
            identityFactory,
            craftingSystemAPI,
            essenceValidator,
            essenceStore
        });
    }

    private makeComponentAPI(identityFactory: DefaultIdentityFactory,
                             localizationService: DefaultLocalizationService,
                             craftingSystemAPI: CraftingSystemAPI,
                             essenceAPI: EssenceAPI,
                             documentManager: DocumentManager): ComponentAPI {
        const componentStore = new EntityDataStore<ComponentJson, Component>({
            entityName: "Component",
            entityFactory: new ComponentFactory({ essenceAPI, documentManager }),
            collectionManager: new ComponentCollectionManager(),
            settingManager: new DefaultSettingManager({
                moduleId: Properties.module.id,
                settingKey: "components",
                clientSettings: this.clientSettings
            })
        });
        return new DefaultComponentAPI({
            notificationService: new DefaultNotificationService(),
            localizationService,
            identityFactory,
            componentValidator: new ComponentValidator({ craftingSystemAPI, essenceAPI, documentManager }),
            componentStore
        });
    }

    private makeRecipeAPI(notificationService: DefaultNotificationService,
                          identityFactory: DefaultIdentityFactory,
                          localizationService: DefaultLocalizationService,
                          essenceAPI: EssenceAPI,
                          componentAPI: ComponentAPI): RecipeAPI {
        return new DefaultRecipeAPI();
    }

}

export { DefaultFabricateAPIFactory }

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
     * Gets the most recent Fabricate data model version
     * */
    readonly dataModelVersion: string;

}
export { FabricateAPI }

class DefaultFabricateAPI implements FabricateAPI {

    private readonly recipeAPI: RecipeAPI;
    private readonly componentAPI: ComponentAPI;
    private readonly essenceAPI: EssenceAPI;
    private readonly craftingSystemAPI: CraftingSystemAPI;

    constructor({
        recipeAPI,
        componentAPI,
        essenceAPI,
        craftingSystemAPI,
    }: {
        recipeAPI: RecipeAPI;
        componentAPI: ComponentAPI;
        essenceAPI: EssenceAPI;
        craftingSystemAPI: CraftingSystemAPI;
    }) {
        this.recipeAPI = recipeAPI;
        this.componentAPI = componentAPI;
        this.essenceAPI = essenceAPI;
        this.craftingSystemAPI = craftingSystemAPI;
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

    readonly dataModelVersion: string;

    migrateData(): Promise<void> {
        return Promise.resolve(undefined);
    }

}


export { DefaultFabricateAPI }