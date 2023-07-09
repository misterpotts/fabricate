import {CraftingSystemAPI, DefaultCraftingSystemAPI} from "./CraftingSystemAPI";
import {DefaultEssenceAPI, EssenceAPI} from "./EssenceAPI";
import {ComponentAPI, DefaultComponentAPI} from "./ComponentAPI";
import {DefaultRecipeAPI, RecipeAPI} from "./RecipeAPI";
import {DefaultIdentityFactory, IdentityFactory} from "../foundry/IdentityFactory";
import {DefaultLocalizationService} from "../../applications/common/LocalizationService";
import {DefaultGameProvider, GameProvider} from "../foundry/GameProvider";
import {DefaultSettingManager} from "./SettingManager";
import Properties from "../Properties";
import {CraftingSystem, CraftingSystemJson} from "../system/CraftingSystem";
import {EntityDataStore} from "./EntityDataStore";
import {CraftingSystemFactory} from "../system/CraftingSystemFactory";
import {
    ComponentCollectionManager,
    CraftingSystemCollectionManager,
    EssenceCollectionManager, RecipeCollectionManager
} from "./CollectionManager";
import {DefaultDocumentManager, DocumentManager} from "../foundry/DocumentManager";
import {Essence, EssenceJson} from "../crafting/essence/Essence";
import {EssenceFactory} from "../crafting/essence/EssenceFactory";
import {Component, ComponentJson} from "../crafting/component/Component";
import {ComponentFactory} from "../crafting/component/ComponentFactory";
import {RecipeFactory} from "../crafting/recipe/RecipeFactory";
import {Recipe, RecipeJson} from "../crafting/recipe/Recipe";
import {CraftingSystemValidator} from "../system/CraftingSystemValidator";
import {DefaultEssenceValidator} from "../crafting/essence/EssenceValidator";
import {DefaultComponentValidator} from "../crafting/component/ComponentValidator";
import {DefaultRecipeValidator} from "../crafting/recipe/RecipeValidator";
import {DefaultNotificationService} from "../foundry/NotificationService";
import {DefaultUIProvider, UIProvider} from "../foundry/UIProvider";

interface FabricateAPIFactory {

    make(): FabricateAPI;

}

export { FabricateAPIFactory }

class DefaultFabricateAPIFactory implements FabricateAPIFactory {

    private readonly gameSystem: string;
    private readonly user: string;
    private readonly clientSettings: ClientSettings;
    private readonly gameProvider: GameProvider;
    private readonly uiProvider: UIProvider;
    private readonly documentManager: DocumentManager;
    private readonly identityFactory: IdentityFactory;

    constructor({
        gameSystem,
        user,
        clientSettings,
        gameProvider = new DefaultGameProvider(),
        documentManager = new DefaultDocumentManager(),
        identityFactory = new DefaultIdentityFactory(),
        uiProvider = new DefaultUIProvider()
    }: {
        gameSystem: string;
        user: string;
        clientSettings: ClientSettings;
        gameProvider?: GameProvider;
        documentManager?: DocumentManager;
        identityFactory?: IdentityFactory;
        uiProvider?: UIProvider;
    }) {
        this.gameSystem = gameSystem;
        this.user = user;
        this.clientSettings = clientSettings;
        this.gameProvider = gameProvider;
        this.documentManager = documentManager;
        this.identityFactory = identityFactory;
        this.uiProvider = uiProvider;
    }

    make(): FabricateAPI {

        const localizationService = new DefaultLocalizationService(this.gameProvider);

        const craftingSystemAPI = this.makeCraftingSystemAPI(this.identityFactory, localizationService);
        const essenceAPI = this.makeEssenceAPI(this.identityFactory, localizationService, craftingSystemAPI, this.documentManager);
        const componentAPI = this.makeComponentAPI(this.identityFactory, localizationService, craftingSystemAPI, essenceAPI, this.documentManager);
        const recipeAPI = this.makeRecipeAPI(this.identityFactory, localizationService, craftingSystemAPI, essenceAPI, componentAPI, this.documentManager);

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
            notificationService: new DefaultNotificationService(this.uiProvider),
            identityFactory,
            localizationService,
            craftingSystemValidator: new CraftingSystemValidator(),
            craftingSystemStore: new EntityDataStore<CraftingSystemJson, CraftingSystem>({
                entityName: "Crafting System",
                entityFactory: new CraftingSystemFactory(),
                collectionManager: new CraftingSystemCollectionManager(),
                settingManager: new DefaultSettingManager({
                    moduleId: Properties.module.id,
                    settingKey: Properties.settings.craftingSystems.key,
                    clientSettings: this.clientSettings

                })
            })
        });
    }

    private makeEssenceAPI(identityFactory: DefaultIdentityFactory,
                           localizationService: DefaultLocalizationService,
                           craftingSystemAPI: CraftingSystemAPI,
                           documentManager: DocumentManager): EssenceAPI {
        const essenceValidator = new DefaultEssenceValidator({ craftingSystemAPI, documentManager });
        const essenceStore = new EntityDataStore<EssenceJson, Essence>({
            entityName: "Essence",
            collectionManager: new EssenceCollectionManager(),
            settingManager: new DefaultSettingManager({
                moduleId: Properties.module.id,
                settingKey: Properties.settings.essences.key,
                clientSettings: this.clientSettings
            }),
            entityFactory: new EssenceFactory(documentManager),
        });
        return new DefaultEssenceAPI({
            notificationService: new DefaultNotificationService(this.uiProvider),
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
            entityFactory: new ComponentFactory({ documentManager }),
            collectionManager: new ComponentCollectionManager(),
            settingManager: new DefaultSettingManager({
                moduleId: Properties.module.id,
                settingKey: Properties.settings.components.key,
                clientSettings: this.clientSettings
            })
        });
        return new DefaultComponentAPI({
            notificationService: new DefaultNotificationService(this.uiProvider),
            localizationService,
            identityFactory,
            componentValidator: new DefaultComponentValidator({ craftingSystemAPI, essenceAPI }),
            componentStore
        });
    }

    private makeRecipeAPI(identityFactory: DefaultIdentityFactory,
                          localizationService: DefaultLocalizationService,
                          craftingSystemAPI: CraftingSystemAPI,
                          essenceAPI: EssenceAPI,
                          componentAPI: ComponentAPI,
                          documentManager: DocumentManager): RecipeAPI {
        const recipeStore = new EntityDataStore<RecipeJson, Recipe>({
            entityName: "Recipe",
            entityFactory: new RecipeFactory({ essenceAPI, componentAPI, documentManager }),
            collectionManager: new RecipeCollectionManager(),
            settingManager: new DefaultSettingManager({
                moduleId: Properties.module.id,
                settingKey: Properties.settings.recipes.key,
                clientSettings: this.clientSettings
            })
        });
        return new DefaultRecipeAPI({
            notificationService: new DefaultNotificationService(this.uiProvider),
            identityFactory,
            localizationService,
            recipeValidator: new DefaultRecipeValidator({ essenceAPI, componentAPI, craftingSystemAPI, documentManager }),
            recipeStore
        });
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