import Properties from "./Properties";
import {GameProvider} from "./foundry/GameProvider";
import CraftingSystemManagerAppFactory from "./interface/apps/CraftingSystemManagerApp";
import FabricateApplication from "./interface/FabricateApplication";
import {DefaultSettingManager, FabricateSettingMigrator} from "./interface/settings/FabricateSettings";
import {DefaultSystemRegistry, ErrorDecisionType} from "./registries/SystemRegistry";
import {CraftingSystemFactory} from "./system/CraftingSystemFactory";
import {CraftingSystemJson} from "./system/CraftingSystem";
import {ApplicationWindow, ItemSheetExtension} from "./interface/apps/core/Applications";
import {FabricateItemSheetTab} from "./interface/FabricateItemSheetTab";
import {DefaultInventoryRegistry} from "./registries/InventoryRegistry";
import {DefaultInventoryFactory} from "./actor/InventoryFactory";

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

    const embeddedSystems = await FabricateApplication.systemRegistry.getEmbeddedSystems();
    const userDefinedSystems = await FabricateApplication.systemRegistry.getUserDefinedSystems();
    const applicationWindow = await CraftingSystemManagerAppFactory.make({embeddedSystems, userDefinedSystems});
    button.on('click', async (_event) => {
        applicationWindow.render();
    });
    buttons.append(button);
});


Hooks.on("renderItemSheet", async (app: any, html: any) => {
    const systemsById = await FabricateApplication.systemRegistry.getAllCraftingSystems();
    const craftingSystems = Array.from(systemsById.values());
    const itemSheetExtension = new ItemSheetExtension({
        app,
        html,
        itemSheetModifier: new FabricateItemSheetTab({craftingSystems})
    });
    await itemSheetExtension.render();
});

Hooks.once('init', async () => {
    /*
    * Create the Inventory registry
    */
    const inventoryFactory = new DefaultInventoryFactory();
    const inventoryRegistry = new DefaultInventoryRegistry({inventoryFactory});
    /*
    * Create the Crafting System registry
    */
    const gameProvider = new GameProvider();
    const gameObject = gameProvider.globalGameObject();
    const craftingSystemSettingManager = new DefaultSettingManager<Record<string, CraftingSystemJson>>({
        gameProvider: gameProvider,
        moduleId: Properties.module.id,
        settingKey: Properties.settings.craftingSystems.key,
        targetVersion: Properties.settings.craftingSystems.targetVersion,
        settingsMigrators: new Map<string, FabricateSettingMigrator<any, any>>() // still on v1 :shrug:
    });
    const systemRegistry = new DefaultSystemRegistry({
        settingManager: craftingSystemSettingManager,
        gameSystem: gameObject.system.id,
        craftingSystemFactory: new CraftingSystemFactory({}),
        errorDecisionProvider: async (error: Error) => {
            const reset = await Dialog.confirm({
                title: gameObject.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.readErrorPrompt.title`),
                content: `<p>${gameObject.i18n.format(Properties.module.id + ".CraftingSystemManagerApp.readErrorPrompt.content", {errorMessage: error.message})}</p>`,
            });
            if (reset) {
                return ErrorDecisionType.RESET;
            }
            return ErrorDecisionType.RETAIN;
        }
    });
    FabricateApplication.systemRegistry = systemRegistry;
    /*
    * Register game settings for Fabricate
    */
    gameObject.settings.register(Properties.module.id, Properties.settings.craftingSystems.key, {
        name: "",
        hint: "",
        scope: "world",
        config: false,
        type: Object,
        default: systemRegistry.getDefaultSettingValue(),
        onChange: () => {
            // Reload the crafting system UI if it exists
            const applicationWindow: ApplicationWindow<any, any> = <ApplicationWindow<any, any>>Object.values(ui.windows)
                .find(w => w.id == "fabricate-crafting-system-manager");
            applicationWindow.reload();
            // Reload all open item application windows
            Object.values(ui.windows)
                .filter(w => w instanceof ItemSheet)
                .forEach(w => w.render());
        }
    });
    // Cleans up the old embedded system data which should no longer be stored in game settings
    try {
        // todo: remove purge in later versions
        await systemRegistry.purgeBundledSystemsFromStoredSettings();
    } catch (e: any) {
        console.warn(`Unable to purge Fabricate's bundled systems from world settings. ${{e}}`)
    }
    // Makes the system registry externally available
    // @ts-ignore
    gameObject[Properties.module.id] = {};
    // @ts-ignore
    gameObject[Properties.module.id].SystemRegistry = systemRegistry;
    // @ts-ignore
    gameObject[Properties.module.id].InventoryRegistry = inventoryRegistry;
});

Hooks.once('ready', () => {

    Promise.all([
        getTemplate(Properties.module.templates.partials.editableSystem),
        getTemplate(Properties.module.templates.partials.readOnlySystem),
        getTemplate(Properties.module.templates.partials.recipesTab),
        getTemplate(Properties.module.templates.partials.componentsTab),
        getTemplate(Properties.module.templates.partials.essencesTab),
        getTemplate(Properties.module.templates.partials.alchemyTab),
        getTemplate(Properties.module.templates.partials.checksTab),
    ]).then(templates => {
        Handlebars.registerPartial('editableSystem', templates[0]);
        Handlebars.registerPartial('readOnlySystem', templates[1]);
        Handlebars.registerPartial('recipesTab', templates[2]);
        Handlebars.registerPartial('componentsTab', templates[3]);
        Handlebars.registerPartial('essencesTab', templates[4]);
        Handlebars.registerPartial('alchemyTab', templates[5]);
        Handlebars.registerPartial('checksTab', templates[6]);
    });

    Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
        // @ts-ignore
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper ('truncate', function (string, maxLength) {
        if (string?.length <= maxLength) {
            return new Handlebars.SafeString(string);
        }
        const lastWhitespaceIndex = string.lastIndexOf(" ");
        const lastWordTerminationIndex = lastWhitespaceIndex >= 0 ? lastWhitespaceIndex : string.length;
        if (lastWordTerminationIndex > maxLength) {
            return new Handlebars.SafeString(`${string.substring(0, maxLength)}...`);
        }
        return new Handlebars.SafeString(`${string.substring(0, lastWordTerminationIndex)}...`);
    });

});


