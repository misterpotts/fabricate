import Properties from "./Properties";
import {DefaultGameProvider} from "./foundry/GameProvider";
import {itemUpdated, itemDeleted, itemCreated} from "../applications/common/EventBus";
import {BaseItem} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs";
import {DefaultFabricateAPIFactory, FabricateAPIFactory} from "./api/FabricateAPIFactory";
import {FabricateAPI} from "./api/FabricateAPI";
import {DefaultIdentityFactory} from "./foundry/IdentityFactory";
import {DefaultDocumentManager} from "./foundry/DocumentManager";
import {DefaultSettingsRegistry, SettingsRegistry} from "./repository/SettingsRegistry";
import {DefaultFabricateUserInterfaceAPIFactory} from "./api/FabricateUserInterfaceAPIFactory";
import {DefaultUIProvider} from "./foundry/UIProvider";
import {FabricateUserInterfaceAPI} from "./api/FabricateUserInterfaceAPI";

let fabricateAPI: FabricateAPI;
let fabricateUserInterfaceAPI: FabricateUserInterfaceAPI;

Hooks.once('ready', async () => {

    const gameProvider = new DefaultGameProvider();
    const uiProvider = new DefaultUIProvider();
    const gameObject = gameProvider.get();

    const settingsRegistry: SettingsRegistry = new DefaultSettingsRegistry({
        gameProvider,
        clientSettings: gameObject.settings,
        settingKeys: [
            Properties.settings.recipes.key,
            Properties.settings.essences.key,
            Properties.settings.components.key,
            Properties.settings.craftingSystems.key,
        ]
    });

    settingsRegistry.registerAll();

    const fabricateAPIFactory: FabricateAPIFactory = new DefaultFabricateAPIFactory({
        gameProvider,
        uiProvider,
        settingsRegistry,
        user: gameObject.user.name,
        gameSystem: gameObject.system.id,
        clientSettings: gameObject.settings,
        identityFactory: new DefaultIdentityFactory(),
        documentManager: new DefaultDocumentManager(),
    });

    fabricateAPI = fabricateAPIFactory.make();

    const fabricateUserInterfaceAPIFactory = new DefaultFabricateUserInterfaceAPIFactory({
        fabricateAPI,
        gameProvider,
    });

    fabricateUserInterfaceAPI = fabricateUserInterfaceAPIFactory.make();

    // Sets the default value of game.fabricate to an empty object
    // @ts-ignore
    gameObject[Properties.module.id] = {};
    // Makes the Fabricate API available globally as game.fabricate.api
    // @ts-ignore
    gameObject[Properties.module.id].api = fabricateAPI;
    // Makes the Fabricate User Interface API available globally as game.fabricate.ui
    // @ts-ignore
    gameObject[Properties.module.id].ui = fabricateUserInterfaceAPI;

    Hooks.callAll(`${Properties.module.id}.ready`, fabricateAPI, fabricateUserInterfaceAPI);

});

Hooks.once(`${Properties.module.id}.ready`, async (fabricateAPI: FabricateAPI) => {

    const migrationNeeded = await fabricateAPI.migration.isMigrationNeeded();
    if (migrationNeeded) {
        await fabricateAPI.migration.migrateAll();
    }

});

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

    const craftingSystemsById = await fabricateAPI.craftingSystems.getAll();
    const componentsForSourceItem = await fabricateAPI.components.getAllByItemUuid(sourceItemUuid);
    await Promise.all(Array.from(componentsForSourceItem.values()).map(component => component.load()));
    const recipesForSourceItem = await fabricateAPI.recipes.getAllByItemUuid(sourceItemUuid);
    await Promise.all(Array.from(recipesForSourceItem.values()).map(recipe => recipe.load()));
    if (componentsForSourceItem.size === 0 && recipesForSourceItem.size === 0) {
        return;
    }

    const additionalHeaderButtons = [];

    const salvageButtons = Array.from(componentsForSourceItem.values())
        .filter(component => !component.isDisabled && component.isSalvageable && !component.hasErrors)
        .map(component => {
            return {
                label: "Salvage",
                tooltip: craftingSystemsById.get(component.craftingSystemId).details.name,
                class: "fab-item-sheet-header-button",
                icon: "fa-solid fa-recycle",
                onclick: async () => {
                    await fabricateUserInterfaceAPI.renderComponentSalvageApp(component.id, document.actor.id);
                }
            };
        });
    additionalHeaderButtons.push(...salvageButtons);

    const craftingButtons = Array.from(recipesForSourceItem.values())
        .filter(recipe => !recipe.isDisabled && recipe.hasResults && !recipe.hasErrors)
        .map(recipe => {
            return {
                label: "Craft",
                tooltip: craftingSystemsById.get(recipe.craftingSystemId).details.name,
                class: "fab-item-sheet-header-button",
                icon: "fa-solid fa-screwdriver-wrench",
                onclick: async () => {
                    await fabricateUserInterfaceAPI.renderRecipeCraftingApp(recipe.id, document.actor.id);
                }
            };
        });
    additionalHeaderButtons.push(...craftingButtons);

    const header = html.find(".window-header");
    if (!header) {
        throw new Error("Fabricate was unable to render header buttons for the Item Sheet application");
    }
    let title = header.children(".window-title");
    additionalHeaderButtons.forEach(headerButton => {
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
        await fabricateUserInterfaceAPI.renderCraftingSystemManagerApp();
    });

    buttons.append(button);
});