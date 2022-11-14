import Properties from "./Properties";
import {GameProvider} from "./foundry/GameProvider";
import {CraftingSystemManagerApp} from "./interface/apps/CraftingSystemManagerApp";
import FabricateApplication from "./interface/FabricateApplication";
import {DefaultSettingsManager, FabricateSettingMigrator} from "./interface/settings/FabricateSettings";
import {DefaultSystemRegistry} from "./registries/SystemRegistry";
import {CraftingSystemFactory} from "./system/CraftingSystemFactory";

Hooks.on("renderSidebarTab", (app: any, html: any) => {
    const GAME = new GameProvider().globalGameObject();
    if (!(app instanceof ItemDirectory) || !GAME.user.isGM) {
        return;
    }
    const buttons = html.find(`.header-actions.action-buttons`);
    const buttonClass = Properties.ui.buttons.openCraftingSystemManager.class;
    const buttonText = GAME.i18n.localize(`${Properties.module.id}.ui.sidebar.buttons.openCraftingSystemManager`);
    const button = $(`<button class="${buttonClass}"><i class="fa-solid fa-flask-vial"></i> ${buttonText}</button>`);
    button.on('click', async (_event) => {
        await new CraftingSystemManagerApp().render();
    });
    buttons.append(button);
});

Hooks.once('init', async () => {
    const gameProvider = new GameProvider();
    const settingsManager = new DefaultSettingsManager({
        moduleId: Properties.module.id,
        targetVersionsByRootSettingKey: new Map([[Properties.settings.craftingSystems.key, Properties.settings.craftingSystems.targetVersion]]),
        gameProvider: gameProvider,
        settingsMigrators: new Map<string, Map<string, FabricateSettingMigrator<any, any>>>()
    });
    const systemRegistry = new DefaultSystemRegistry({
        settingsManager: settingsManager,
        craftingSystemFactory: new CraftingSystemFactory({})
    });
    FabricateApplication.systemRegistry = systemRegistry;
    // @ts-ignore
    globalThis.ui.CraftingSystemManagerApp = CraftingSystemManagerApp;
    gameProvider.globalGameObject().settings.register(Properties.module.id, "craftingSystems", {
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
});

// Hooks.on('renderActorSheet5e', (sheetData: ItemSheet, sheetHtml: any, eventData: any) => {
//     CraftingTab.bind(sheetData, sheetHtml, eventData);
// });
//
// Hooks.on('renderItemSheet5e', (sheetData: ItemSheet, sheetHtml: any) => {
//     ItemRecipeTab.bind(sheetData, sheetHtml);
// });

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


});


