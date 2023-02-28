import Properties from "./Properties";
import {GameProvider} from "./foundry/GameProvider";
import FabricateApplication from "./interface/FabricateApplication";
import {
    DefaultSettingManager,
    FabricateSetting,
    SettingManager,
    SettingState
} from "./settings/FabricateSetting";
import {DefaultSystemRegistry} from "./registries/SystemRegistry";
import {CraftingSystemFactory} from "./system/CraftingSystemFactory";
import {CraftingSystemJson} from "./system/CraftingSystem";
import {DefaultInventoryRegistry} from "./registries/InventoryRegistry";
import {DefaultInventoryFactory} from "./actor/InventoryFactory";
import {CraftingSystemManagerAppFactory} from "../applications/CraftingSystemManager";
import {V2CraftingSystemSettingMigrator} from "./settings/migrators/V2CraftingSystemSettingMigrator";
import {FabricateEventBus, ItemDeleted} from "../templates/FabricateEventBus";
import HeaderButton = Application.HeaderButton;

// `app` is an unknown type. Will need to consult foundry docs or crawl `foundry.js` to figure out what it is, but it seems JQuery related
// `id` is useless to Fabricate
Hooks.on("deleteItem", async (item: any, _app: unknown, _id: string) => {
    const itemDeletedEvent = new ItemDeleted(item);
    FabricateEventBus.dispatch(itemDeletedEvent);
});

Hooks.on("getItemSheetHeaderButtons", async (itemSheet: ItemSheet, headerButtons: HeaderButton[]) => {
    if (!itemSheet.actor) {
        console.log("Not owned, not intractable. ");
        return;
    }
    if (!Properties.module.documents.supportedTypes.includes(itemSheet.document.documentName)) {
        console.log("Not a supported document type. ");
        return;
    }
    const sourceItemUuid = itemSheet.document.getFlag("core", "sourceId");
    if (!sourceItemUuid) {
        console.log("Not created from another item. ");
        return;
    }
    // todo: optimise by partially loading recipes/components/essences without fetching related item data or populating references
    const allCraftingSystems = await FabricateApplication.systemRegistry.getAllCraftingSystems();
    const loadedSystems = await Promise.all(Array.from(allCraftingSystems.values())
        .map(async craftingSystem => {
            await craftingSystem.loadPartDictionary();
            return craftingSystem;
        }));
    const headerButtonsToAdd = loadedSystems.filter(craftingSystem => craftingSystem.includesItemUuid(sourceItemUuid))
        .flatMap(craftingSystem => {
            const additionalHeaderButtons: HeaderButton[] = [];
            if (craftingSystem.includesRecipeByItemUuid(sourceItemUuid)) {
                const recipe = craftingSystem.getRecipeByItemUuid(sourceItemUuid);
                additionalHeaderButtons.push({
                    label: `Craft (${craftingSystem.name})`,
                    class: "fab-item-sheet-header-button",
                    icon: "fa-solid fa-screwdriver-wrench",
                    onclick: () => { console.log(`Clicked craft Recipe ${recipe.name}`); }
                });
            }
            if (craftingSystem.includesComponentByItemUuid(sourceItemUuid)) {
                const craftingComponent = craftingSystem.getComponentByItemUuid(sourceItemUuid);
                additionalHeaderButtons.push({
                    label: `Salvage (${craftingSystem.name})`,
                    class: "fab-item-sheet-header-button",
                    icon: "fa-solid fa-recycle",
                    onclick: () => { console.log(`Clicked salvage Crafting Component ${craftingComponent.name}`); }
                });
            }
            return additionalHeaderButtons;
        });
    headerButtons.unshift(...headerButtonsToAdd);
});

Hooks.on("renderSidebarTab", async (app: any, html: any) => {
    const GAME = new GameProvider().globalGameObject();
    if (!(app instanceof ItemDirectory) || !GAME.user.isGM) {
        return;
    }
    const buttons = html.find(`.header-actions.action-buttons`);
    const buttonClass = Properties.ui.buttons.openCraftingSystemManager.class;
    const buttonText = GAME.i18n.localize(`${Properties.module.id}.ui.sidebar.buttons.openCraftingSystemManager`);
    const button = $(`<button class="${buttonClass}"><i class="fa-solid fa-flask-vial"></i> ${buttonText}</button>`);

    button.on('click', async (_event) => {
        FabricateApplication.craftingSystemManagerApp.render(true);
    });

    buttons.append(button);
});

function registerSettings(gameObject: Game, defaultSettingValue: FabricateSetting<Record<string, CraftingSystemJson>>) {
    /*
    * Register game settings for Fabricate
    */
    gameObject.settings.register(Properties.module.id, Properties.settings.craftingSystems.key, {
        name: "",
        hint: "",
        scope: "world",
        config: false,
        type: Object,
        default: defaultSettingValue
    });
}

async function validateAndMigrateSettings(gameProvider: GameProvider, craftingSystemSettingManager: DefaultSettingManager<Record<string, CraftingSystemJson>>): Promise<SettingManager<Record<string, CraftingSystemJson>>> {

    const checkResult = craftingSystemSettingManager.check()
    const gameObject = gameProvider.globalGameObject();

    if (checkResult.state === SettingState.INVALID) {
        const errorDetails = checkResult.validationCheck.errors
            .map(errorKey => gameObject.i18n.localize(`fabricate.ui.notifications.settings.errors.${errorKey}`));
        const errorSummary = gameObject.i18n.format(
            "fabricate.ui.notifications.settings.errors.summary",
            { settingKey: craftingSystemSettingManager.settingKey }
        );
        ui.notifications.error(`${errorSummary} ${errorDetails.join(", ")}`);
    }

    if (checkResult.state === SettingState.OUTDATED) {
        ui.notifications.info(gameObject.i18n.localize("fabricate.ui.notifications.settings.migration.started"));
        const migrationResult = await craftingSystemSettingManager.migrate();
        if (migrationResult.isSuccessful) {
            ui.notifications.info(gameObject.i18n.localize("fabricate.ui.notifications.settings.migration.finished"));
        } else {
            ui.notifications.error(gameObject.i18n.format(
                "fabricate.ui.notifications.settings.errors.migration",
                { settingKey: craftingSystemSettingManager.settingKey }
            ));
        }
    }

    return craftingSystemSettingManager;
}

Hooks.once('ready', async () => {

    const gameProvider = new GameProvider();
    const gameObject = gameProvider.globalGameObject();


    const v2settingMigrator = new V2CraftingSystemSettingMigrator();
    const craftingSystemSettingManager = new DefaultSettingManager<Record<string, CraftingSystemJson>>({
        gameProvider: gameProvider,
        moduleId: Properties.module.id,
        settingKey: Properties.settings.craftingSystems.key,
        targetVersion: Properties.settings.craftingSystems.targetVersion,
        settingsMigrators: [v2settingMigrator]
    });

    /*
    * Create the Crafting System registry
    */
    const systemRegistry = new DefaultSystemRegistry({
        settingManager: craftingSystemSettingManager,
        gameSystem: gameObject.system.id,
        craftingSystemFactory: new CraftingSystemFactory({})
    });
    FabricateApplication.systemRegistry = systemRegistry;

    registerSettings(gameObject, systemRegistry.getDefaultSettingValue());
    await validateAndMigrateSettings(gameProvider, craftingSystemSettingManager);

    /*
    * Create the Inventory registry
    */
    const inventoryFactory = new DefaultInventoryFactory();
    const inventoryRegistry = new DefaultInventoryRegistry({inventoryFactory});

    FabricateApplication.craftingSystemManagerApp = CraftingSystemManagerAppFactory.make(systemRegistry);

    // Makes the system registry externally available
    // @ts-ignore
    gameObject[Properties.module.id] = {};
    // @ts-ignore
    gameObject[Properties.module.id].SystemRegistry = systemRegistry;
    // @ts-ignore
    gameObject[Properties.module.id].InventoryRegistry = inventoryRegistry;

    // todo: deleteme
    FabricateApplication.craftingSystemManagerApp.render(true);
});