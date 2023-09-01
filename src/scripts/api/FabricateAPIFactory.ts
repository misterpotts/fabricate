import {DefaultGameProvider, GameProvider} from "../foundry/GameProvider";
import {DefaultUIProvider, UIProvider} from "../foundry/UIProvider";
import {DefaultDocumentManager, DocumentManager} from "../foundry/DocumentManager";
import {DefaultIdentityFactory, IdentityFactory} from "../foundry/IdentityFactory";
import {DefaultLocalizationService} from "../../applications/common/LocalizationService";
import {DefaultSettingMigrationAPI, SettingMigrationAPI} from "./SettingMigrationAPI";
import {CraftingSystemAPI, DefaultCraftingSystemAPI} from "./CraftingSystemAPI";
import {DefaultNotificationService} from "../foundry/NotificationService";
import {CraftingSystemValidator} from "../system/CraftingSystemValidator";
import {EntityDataStore, SerialisedEntityData} from "../repository/EntityDataStore";
import {CraftingSystem, CraftingSystemJson} from "../system/CraftingSystem";
import {CraftingSystemFactory} from "../system/CraftingSystemFactory";
import {
    ComponentCollectionManager,
    CraftingSystemCollectionManager,
    EssenceCollectionManager,
    RecipeCollectionManager
} from "../repository/CollectionManager";
import {DefaultSettingManager, SettingManager} from "../repository/SettingManager";
import Properties from "../Properties";
import {DefaultEssenceAPI, EssenceAPI} from "./EssenceAPI";
import {DefaultEssenceValidator} from "../crafting/essence/EssenceValidator";
import {Essence, EssenceJson} from "../crafting/essence/Essence";
import {EssenceFactory} from "../crafting/essence/EssenceFactory";
import {ComponentAPI, DefaultComponentAPI} from "./ComponentAPI";
import {Component, ComponentJson} from "../crafting/component/Component";
import {ComponentFactory} from "../crafting/component/ComponentFactory";
import {DefaultComponentValidator} from "../crafting/component/ComponentValidator";
import {DefaultRecipeAPI, RecipeAPI} from "./RecipeAPI";
import {Recipe, RecipeJson} from "../crafting/recipe/Recipe";
import {RecipeFactory} from "../crafting/recipe/RecipeFactory";
import {DefaultRecipeValidator} from "../crafting/recipe/RecipeValidator";
import {DefaultFabricateAPI, FabricateAPI} from "./FabricateAPI";
import {DefaultSettingsMigrator} from "../repository/migration/DefaultSettingsMigrator";
import {SettingVersion} from "../repository/migration/SettingVersion";
import {
    DefaultEmbeddedCraftingSystemManager,
    EmbeddedCraftingSystemManager
} from "../repository/embedded_systems/EmbeddedCraftingSystemManager";
import {DefaultSettingsRegistry, SettingsRegistry} from "../repository/SettingsRegistry";
import {SettingsMigrator} from "../repository/migration/SettingsMigrator";
import {CraftingAPI, DefaultCraftingAPI} from "./CraftingAPI";
import {V2ToV3SettingMigrationStep} from "../repository/migration/V2ToV3SettingMigrationStep";

interface FabricateAPIFactory {

    make(): FabricateAPI;

}

export { FabricateAPIFactory };

class DefaultFabricateAPIFactory implements FabricateAPIFactory {

    private readonly user: string;
    private readonly gameSystem: string;
    private readonly clientSettings: ClientSettings;
    private readonly uiProvider: UIProvider;
    private readonly gameProvider: GameProvider;
    private readonly documentManager: DocumentManager;
    private readonly identityFactory: IdentityFactory;
    private readonly settingsRegistry: SettingsRegistry;

    constructor({
        user,
        gameSystem,
        clientSettings,
        uiProvider = new DefaultUIProvider(),
        gameProvider = new DefaultGameProvider(),
        documentManager = new DefaultDocumentManager(),
        identityFactory = new DefaultIdentityFactory(),
        settingsRegistry = new DefaultSettingsRegistry({ gameProvider, clientSettings })
    }: {
        user: string;
        gameSystem: string;
        clientSettings: ClientSettings;
        uiProvider?: UIProvider;
        gameProvider?: GameProvider;
        documentManager?: DocumentManager;
        identityFactory?: IdentityFactory;
        settingsRegistry?: SettingsRegistry;
    }) {
        this.user = user;
        this.gameSystem = gameSystem;
        this.clientSettings = clientSettings;
        this.uiProvider = uiProvider;
        this.gameProvider = gameProvider;
        this.documentManager = documentManager;
        this.identityFactory = identityFactory;
        this.settingsRegistry = settingsRegistry;
    }

    make(): FabricateAPI {

        const craftingSystemSettingManager = this.makeSettingManger<SerialisedEntityData<CraftingSystemJson>>(Properties.settings.craftingSystems.key);
        const essenceSettingManager = this.makeSettingManger<SerialisedEntityData<EssenceJson>>(Properties.settings.essences.key);
        const componentSettingManager = this.makeSettingManger<SerialisedEntityData<ComponentJson>>(Properties.settings.components.key);
        const recipeSettingManager = this.makeSettingManger<SerialisedEntityData<RecipeJson>>(Properties.settings.recipes.key);

        const craftingSystemStore = this.makeCraftingSystemStore(craftingSystemSettingManager);
        const essenceStore = this.makeEssenceStore(this.documentManager, essenceSettingManager);
        const componentStore = this.makeComponentStore(this.documentManager, componentSettingManager);
        const recipeStore = this.makeRecipeStore(this.documentManager, recipeSettingManager);

        const localizationService = new DefaultLocalizationService(this.gameProvider);

        const craftingSystemAPI = this.makeCraftingSystemAPI(
            this.identityFactory,
            localizationService,
            craftingSystemSettingManager
        );

        const essenceAPI = this.makeEssenceAPI(
            this.identityFactory,
            localizationService,
            craftingSystemAPI,
            essenceStore
        );

        const componentAPI = this.makeComponentAPI(
            this.identityFactory,
            localizationService,
            craftingSystemAPI,
            essenceAPI,
            componentStore
        );

        const recipeAPI = this.makeRecipeAPI(
            this.identityFactory,
            localizationService,
            craftingSystemAPI,
            essenceAPI,
            componentAPI,
            recipeStore
        );

        const settingMigrationAPI = this.makeSettingMigrationAPI(
            localizationService,
            this.settingsRegistry,
            this.makeEmbeddedCraftingSystemManager(craftingSystemStore, essenceStore, componentStore, recipeStore),
            this.makeSettingsMigrator(craftingSystemSettingManager, essenceSettingManager, componentSettingManager, recipeSettingManager)
        );

        const craftingAPI = this.makeCraftingAPI(
            localizationService,
            craftingSystemAPI,
            essenceAPI,
            componentAPI,
            recipeAPI,
            this.gameProvider
        );

        return new DefaultFabricateAPI({
            recipeAPI,
            essenceAPI,
            craftingAPI,
            componentAPI,
            craftingSystemAPI,
            settingMigrationAPI,
            localizationService,
            notificationService: new DefaultNotificationService(this.uiProvider),
        });

    }

    private makeSettingManger<T>(settingKey: string): SettingManager<T> {
        return new DefaultSettingManager({
            moduleId: Properties.module.id,
            settingKey,
            clientSettings: this.clientSettings
        });
    }

    private makeCraftingSystemAPI(identityFactory: DefaultIdentityFactory,
                                  localizationService: DefaultLocalizationService,
                                  craftingSystemSettingManager: SettingManager<SerialisedEntityData<CraftingSystemJson>>): CraftingSystemAPI {
        return new DefaultCraftingSystemAPI({
            user: this.user,
            notificationService: new DefaultNotificationService(this.uiProvider),
            identityFactory,
            localizationService,
            craftingSystemValidator: new CraftingSystemValidator(),
            craftingSystemStore: this.makeCraftingSystemStore(craftingSystemSettingManager)
        });
    }

    private makeCraftingSystemStore(craftingSystemSettingManager: SettingManager<SerialisedEntityData<CraftingSystemJson>>) {
        return new EntityDataStore<CraftingSystemJson, CraftingSystem>({
            entityName: "Crafting System",
            entityFactory: new CraftingSystemFactory(),
            collectionManager: new CraftingSystemCollectionManager(),
            settingManager: craftingSystemSettingManager
        });
    }

    private makeEssenceAPI(identityFactory: DefaultIdentityFactory,
                           localizationService: DefaultLocalizationService,
                           craftingSystemAPI: CraftingSystemAPI,
                           essenceStore: EntityDataStore<EssenceJson, Essence>): EssenceAPI {
        const essenceValidator = new DefaultEssenceValidator({craftingSystemAPI});
        return new DefaultEssenceAPI({
            notificationService: new DefaultNotificationService(this.uiProvider),
            localizationService,
            identityFactory,
            craftingSystemAPI,
            essenceValidator,
            essenceStore
        });
    }

    private makeEssenceStore(documentManager: DocumentManager,
                             essenceSettingManager: SettingManager<SerialisedEntityData<EssenceJson>>) {
        return new EntityDataStore<EssenceJson, Essence>({
            entityName: "Essence",
            collectionManager: new EssenceCollectionManager(),
            settingManager: essenceSettingManager,
            entityFactory: new EssenceFactory(documentManager),
        });
    }

    private makeComponentAPI(identityFactory: DefaultIdentityFactory,
                             localizationService: DefaultLocalizationService,
                             craftingSystemAPI: CraftingSystemAPI,
                             essenceAPI: EssenceAPI,
                             componentStore: EntityDataStore<ComponentJson, Component>): ComponentAPI {
        return new DefaultComponentAPI({
            notificationService: new DefaultNotificationService(this.uiProvider),
            localizationService,
            identityFactory,
            componentValidator: new DefaultComponentValidator({craftingSystemAPI, essenceAPI}),
            componentStore
        });
    }

    private makeComponentStore(documentManager: DocumentManager,
                               componentSettingManager: SettingManager<SerialisedEntityData<ComponentJson>>) {
        return new EntityDataStore<ComponentJson, Component>({
            entityName: "Component",
            entityFactory: new ComponentFactory({documentManager}),
            collectionManager: new ComponentCollectionManager(),
            settingManager: componentSettingManager
        });
    }

    private makeRecipeAPI(identityFactory: DefaultIdentityFactory,
                          localizationService: DefaultLocalizationService,
                          craftingSystemAPI: CraftingSystemAPI,
                          essenceAPI: EssenceAPI,
                          componentAPI: ComponentAPI,
                          recipeStore: EntityDataStore<RecipeJson, Recipe>): RecipeAPI {
        return new DefaultRecipeAPI({
            notificationService: new DefaultNotificationService(this.uiProvider),
            identityFactory,
            localizationService,
            recipeValidator: new DefaultRecipeValidator({essenceAPI, componentAPI, craftingSystemAPI}),
            recipeStore
        });
    }

    private makeRecipeStore(documentManager: DocumentManager,
                            recipeSettingManager: SettingManager<SerialisedEntityData<RecipeJson>>) {
        return new EntityDataStore<RecipeJson, Recipe>({
            entityName: "Recipe",
            entityFactory: new RecipeFactory({documentManager}),
            collectionManager: new RecipeCollectionManager(),
            settingManager: recipeSettingManager
        });
    }

    private makeSettingMigrationAPI(localizationService: DefaultLocalizationService,
                                    settingsRegistry: SettingsRegistry,
                                    embeddedCraftingSystemManager: EmbeddedCraftingSystemManager,
                                    settingsMigrator: SettingsMigrator): SettingMigrationAPI {
        return new DefaultSettingMigrationAPI({
            localizationService,
            settingsRegistry,
            gameSystemId: this.gameSystem,
            notificationService: new DefaultNotificationService(this.uiProvider),
            settingsMigrator,
            embeddedCraftingSystemManager
        });
    }

    private makeEmbeddedCraftingSystemManager(craftingSystemStore: EntityDataStore<CraftingSystemJson, CraftingSystem>,
                                              essenceStore: EntityDataStore<EssenceJson, Essence>,
                                              componentStore: EntityDataStore<ComponentJson, Component>,
                                              recipeStore: EntityDataStore<RecipeJson, Recipe>) {
        return new DefaultEmbeddedCraftingSystemManager({
            craftingSystemStore,
            essenceStore,
            componentStore,
            recipeStore,
        });
    }

    private makeSettingsMigrator(craftingSystemSettingManager: SettingManager<SerialisedEntityData<CraftingSystemJson>>,
                                 essenceSettingManager: SettingManager<SerialisedEntityData<EssenceJson>>,
                                 componentSettingManager: SettingManager<SerialisedEntityData<ComponentJson>>,
                                 recipeSettingManager: SettingManager<SerialisedEntityData<RecipeJson>>) {
        const versionSettingManager = this.makeVersionSettingManager();
        return new DefaultSettingsMigrator({
            versionSettingManager,
            targetVersion: Properties.settings.modelVersion.targetValue,
            stepsBySourceVersion: new Map([
                [SettingVersion.V2, new V2ToV3SettingMigrationStep({
                    identityFactory: this.identityFactory,
                    embeddedCraftingSystemsIds: [],
                    settingManagersBySettingPath: new Map<string, SettingManager<any>>([
                        [craftingSystemSettingManager.settingKey, craftingSystemSettingManager],
                        [essenceSettingManager.settingKey, essenceSettingManager],
                        [componentSettingManager.settingKey, componentSettingManager],
                        [recipeSettingManager.settingKey, recipeSettingManager],
                        [versionSettingManager.settingKey, versionSettingManager]
                    ])
                })]
            ]),
        });
    }

    private makeVersionSettingManager(): SettingManager<string> {
        return new DefaultSettingManager({
            clientSettings: this.clientSettings,
            moduleId: Properties.module.id,
            settingKey: Properties.settings.modelVersion.key
        });
    }

    private makeCraftingAPI(localizationService: DefaultLocalizationService,
                            craftingSystemAPI: CraftingSystemAPI,
                            essenceAPI: EssenceAPI,
                            componentAPI: ComponentAPI,
                            recipeAPI: RecipeAPI,
                            gameProvider: GameProvider): CraftingAPI {
        return new DefaultCraftingAPI({
            recipeAPI,
            essenceAPI,
            gameProvider,
            componentAPI,
            craftingSystemAPI,
            localizationService,
        });
    }
}

export { DefaultFabricateAPIFactory};