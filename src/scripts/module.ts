import Properties from "./Properties";
import {GameProvider} from "./foundry/GameProvider";
import {CraftingSystemManagerApp, CraftingSystemManagerAppFactory} from "./interface/apps/CraftingSystemManagerApp";
import FabricateApplication from "./interface/FabricateApplication";
import {DefaultSettingManager, FabricateSettingMigrator} from "./interface/settings/FabricateSettings";
import {DefaultSystemRegistry, ErrorDecisionType} from "./registries/SystemRegistry";
import {CraftingSystemFactory} from "./system/CraftingSystemFactory";
import {CraftingSystemJson} from "./system/CraftingSystem";
import {ItemSheetExtension} from "./interface/apps/core/Applications";
import {FabricateItemSheetTab} from "./interface/FabricateItemSheetTab";

Hooks.on("renderSidebarTab", async (app: any, html: any) => {
    const GAME = new GameProvider().globalGameObject();
    if (!(app instanceof ItemDirectory) || !GAME.user.isGM) {
        return;
    }
    const buttons = html.find(`.header-actions.action-buttons`);
    const buttonClass = Properties.ui.buttons.openCraftingSystemManager.class;
    const buttonText = GAME.i18n.localize(`${Properties.module.id}.ui.sidebar.buttons.openCraftingSystemManager`);
    const button = $(`<button class="${buttonClass}"><i class="fa-solid fa-flask-vial"></i> ${buttonText}</button>`);

    const systemsById = await FabricateApplication.systemRegistry.getAllCraftingSystems();
    const applicationWindow = await new CraftingSystemManagerAppFactory()
        .make(systemsById);
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
    const gameProvider = new GameProvider();
    const gameObject = gameProvider.globalGameObject();
    const craftingSystemSettingManager = new DefaultSettingManager<Record<string, CraftingSystemJson>>({
        gameProvider: gameProvider,
        moduleId: Properties.module.id,
        settingKey: Properties.settings.craftingSystems.key,
        targetVersion: Properties.settings.craftingSystems.targetVersion,
        settingsMigrators: new Map<string, FabricateSettingMigrator<any, any>>()
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
    // @ts-ignore
    globalThis.ui.CraftingSystemManagerApp = CraftingSystemManagerApp;
    gameObject.settings.register(Properties.module.id, Properties.settings.craftingSystems.key, {
        name: "",
        hint: "",
        scope: "world",
        config: false,
        type: Object,
        default: systemRegistry.getDefaultSettingValue(),
        onChange: () => {
            Object.values(ui.windows)
                .find(w => w instanceof CraftingSystemManagerApp)
                ?.render(true);
        }
    });
    try {
        // todo: remove purge in later versions
        await systemRegistry.purgeBundledSystemsFromStoredSettings();
    } catch (e: any) {
        console.warn(`Unable to purge Fabricate's bundled systems from world settings. ${{e}}`)
    }
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


