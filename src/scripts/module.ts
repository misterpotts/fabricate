import Properties from "./Properties";
import {DefaultGameProvider, GameProvider} from "./foundry/GameProvider";
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
import {CraftingSystemManagerAppFactory} from "../applications/CraftingSystemManagerAppFactory";
import {V2CraftingSystemSettingMigrator} from "./settings/migrators/V2CraftingSystemSettingMigrator";
import {DefaultComponentSalvageAppCatalog} from "../applications/componentSalvageApp/ComponentSalvageAppCatalog";
import {DefaultComponentSalvageAppFactory} from "../applications/componentSalvageApp/ComponentSalvageAppFactory";
import {itemUpdated, itemDeleted, itemCreated} from "../applications/common/EventBus";
import {BaseItem} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs";
import {DefaultRecipeCraftingAppCatalog} from "../applications/recipeCraftingApp/RecipeCraftingAppCatalog";
import {DefaultRecipeCraftingAppFactory} from "../applications/recipeCraftingApp/RecipeCraftingAppFactory";

Hooks.on("deleteItem", async (item: any) => {

    itemDeleted(item);
});

Hooks.on("updateItem", async (item: BaseItem) => {
    itemUpdated(item);
});

Hooks.on("createItem", async (item: BaseItem) => {
    itemCreated(item);
});

Hooks.on("renderItemSheet", async (itemSheet: ItemSheet, html: any) => {
    if (!itemSheet.actor) {
        return;
    }
    const document = itemSheet.document;
    if (!Properties.module.documents.supportedTypes.includes(document.documentName)) {
        return;
    }
    const sourceItemUuid = document.getFlag("core", "sourceId");
    if (!sourceItemUuid) {
        return;
    }
    // todo: optimise by partially loading recipes/components/essences without fetching related item data or populating references
    // this would allow for me to use the getItemSheetHeaderButtons hook, though I'd lose tooltips
    // more importantly though I could load individual items only as needed
    const allCraftingSystems = await FabricateApplication.systemRegistry.getAllCraftingSystems();
    const loadedSystems = await Promise.all(Array.from(allCraftingSystems.values())
        .filter(craftingSystem => craftingSystem.enabled)
        .map(async craftingSystem => {
            await craftingSystem.loadPartDictionary();
            return craftingSystem;
        }));
    const headerButtonsToAdd = loadedSystems.filter(craftingSystem => craftingSystem.includesItemUuid(sourceItemUuid))
        .flatMap(craftingSystem => {
            const additionalHeaderButtons = [];

            if (craftingSystem.includesRecipeByItemUuid(sourceItemUuid)) {
                const recipe = craftingSystem.getRecipeByItemUuid(sourceItemUuid);
                if (!recipe.isDisabled && !recipe.hasErrors && recipe.hasResults) {
                    additionalHeaderButtons.push({
                        label: "Craft",
                        tooltip: craftingSystem.name,
                        icon: "fa-solid fa-screwdriver-wrench",
                        onclick: async () => {
                            const app = await FabricateApplication.recipeCraftingAppCatalog.load(recipe, craftingSystem, document.actor);
                            app.render(true);
                        }
                    });
                }
            }

            if (craftingSystem.includesComponentByItemUuid(sourceItemUuid)) {
                const craftingComponent = craftingSystem.getComponentByItemUuid(sourceItemUuid);
                if (!craftingComponent.isDisabled && !craftingComponent.hasErrors && craftingComponent.isSalvageable) {
                    additionalHeaderButtons.push({
                        label: "Salvage",
                        tooltip: craftingSystem.name,
                        class: "fab-item-sheet-header-button",
                        icon: "fa-solid fa-recycle",
                        onclick: async () => {
                            const app = await FabricateApplication.componentSalvageAppCatalog.load(craftingComponent, craftingSystem, document.actor);
                            app.render(true);
                        }
                    });
                }
            }
            return additionalHeaderButtons;
        });
    const header = html.find(".window-header");
    if (!header) {
        throw new Error("Fabricate was unable to render header buttons for the Item Sheet application");
    }
    let title = header.children(".window-title");
    headerButtonsToAdd.forEach(headerButton => {
        const button = $(`<a class="${headerButton.class}" data-tooltip="${headerButton.tooltip}"><i class="${headerButton.icon}"></i>${headerButton.label}</a>`);
        button.click(() => headerButton.onclick());
        button.insertAfter(title);
    });
});

Hooks.on("renderSidebarTab", async (app: any, html: any) => {
    const GAME = new DefaultGameProvider().get();
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
    const gameObject = gameProvider.get();

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

    const gameProvider = new DefaultGameProvider();
    const gameObject = gameProvider.get();

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

    FabricateApplication.craftingSystemManagerApp = await CraftingSystemManagerAppFactory.make(systemRegistry);

    FabricateApplication.componentSalvageAppCatalog = new DefaultComponentSalvageAppCatalog({
        componentSalvageAppFactory: new DefaultComponentSalvageAppFactory(),
        systemRegistry
    });

    FabricateApplication.recipeCraftingAppCatalog = new DefaultRecipeCraftingAppCatalog({
        recipeCraftingAppFactory: new DefaultRecipeCraftingAppFactory(),
        systemRegistry
    });

    // Makes the system registry externally available
    // @ts-ignore
    gameObject[Properties.module.id] = {};
    // @ts-ignore
    gameObject[Properties.module.id].SystemRegistry = systemRegistry;

});