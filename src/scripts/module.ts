import Properties from "./Properties";
import {GameProvider} from "./foundry/GameProvider";
import FabricateApplication from "./interface/FabricateApplication";
import {
    DefaultSettingManager, FabricateSetting,
    FabricateSettingMigrator,
    SettingManager,
    SettingState
} from "./settings/FabricateSetting";
import {DefaultSystemRegistry} from "./registries/SystemRegistry";
import {CraftingSystemFactory} from "./system/CraftingSystemFactory";
import {CraftingSystemJson} from "./system/CraftingSystem";
import {DefaultInventoryRegistry} from "./registries/InventoryRegistry";
import {DefaultInventoryFactory} from "./actor/InventoryFactory";
import {CraftingSystemManagerAppFactory} from "../applications/CraftingSystemManager";

Hooks.once("ready", () => {
    // todo: deleteme
    FabricateApplication.craftingSystemManagerApp.render(true);
});

// `app` is an unknown type. Will need to consult foundry docs or crawl `foundry.js` to figure out what it is, but it seems JQuery related
// `id` is useless to Fabricate
Hooks.on("deleteItem", async (item: any, _app: unknown, _id: string) => {
    console.log(`Item UUID ${item.uuid} deleted`);
    await FabricateApplication.systemRegistry.handleItemDeleted(item.uuid);
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

Hooks.once('init', async () => {

    const gameProvider = new GameProvider();
    const gameObject = gameProvider.globalGameObject();

    const craftingSystemSettingManager = new DefaultSettingManager<Record<string, CraftingSystemJson>>({
        gameProvider: gameProvider,
        moduleId: Properties.module.id,
        settingKey: Properties.settings.craftingSystems.key,
        targetVersion: Properties.settings.craftingSystems.targetVersion,
        settingsMigrators: new Map<string, FabricateSettingMigrator<any, any>>() // still on v1 :shrug:
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
});